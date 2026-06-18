# 백엔드 정산 로직 설계서

> 작성일: 2026-06-18
> 대상: indp-server (Spring Boot)
> 정책 근거: [CREATOR_SETTLEMENT_POLICY.md](CREATOR_SETTLEMENT_POLICY.md)
> 관련 기존 코드: `DjRevenueService`(스텁), `UserSubscription`(구독자 4,400원/월), `dj-playlist-detail.html`(`<audio>` 재생)

---

## 0. 현재 상태 진단

| 영역 | 현황 |
|------|------|
| 구독자 모델 | `UserSubscription` (User, 4,400원/월, status=ACTIVE, start/end) — **확정** |
| 재생 | 사용자 앱 `<audio>`, 비구독자는 `PREVIEW_SECS` 미리듣기 |
| 청취시간 기록 | **없음** (DjLiveService.getListeners → 0 고정) |
| 수익 API | `GET /api/dj/revenue` → `DjRevenueResponse(null,null,null)` 스텁 |
| 적립/정산 | **없음** |

→ 정산은 **청취시간 기록 인프라가 전제**다. 아래 4계층으로 단계 구현한다.

```
[L0] 청취 기록   heartbeat 수집 → listening_daily (일별 누적)
[L1] 월 적립     월 마감 집계 × 단가 → creator_balance + creator_ledger
[L2] 정산 신청   잔액 ≥ 5만원 시 크리에이터 신청 → payout_request (원천징수)
[L3] 조회/관리   DJ 정산 카드 · 관리자 승인/지급
```

---

## 1. 핵심 단가 — 정수 연산 규칙

부동소수 누적 오차를 피하기 위해 **초 단위 정수 규칙**으로 환산한다.

```
단가 1.0417원/시간 = 500,000원 / 480,000시간
초당 = 1.0417 / 3600

⇒ 3,456 청취초 = 1원   (3600 × 480,000 / 500,000 = 3,456)
```

**적립액(원) = floor(총 청취초 / 3456)**

검증: 2,000명 × 8h × 30일 = 480,000h = 1,728,000,000초 → ÷3456 = **500,000원** ✓
이 규칙으로 모든 적립은 `long` 정수 연산만 사용한다. 단가 변경 시 `SECONDS_PER_WON` 상수만 교체.

---

## 2. 데이터 모델 (신규 테이블 4종)

> `ddl-auto: update`이므로 엔티티 추가 시 테이블 자동 생성 (수동 마이그레이션 불필요, 기존 컨벤션과 동일).

> **사업자 구분(처음부터 적용):** `creator` 테이블에 정산 유형 컬럼을 추가한다.
> ```sql
> ALTER TABLE creator
>   ADD COLUMN settlement_type   VARCHAR(20) NOT NULL DEFAULT 'INDIVIDUAL', -- INDIVIDUAL | BUSINESS
>   ADD COLUMN business_number   VARCHAR(20) NULL;                          -- 사업자등록번호 (BUSINESS만)
> ```
> 관리자 계정 생성/수정(`CreateCreatorRequest`, `AdminCreatorController`)에 `settlementType`·`businessNumber` 입력을 추가한다. 기본값은 개인(INDIVIDUAL).

```sql
-- L0: 일별 청취 집계 (UPSERT 누적, 행 수 = 사용자×크리에이터×일)
CREATE TABLE listening_daily (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id     BIGINT NOT NULL,
  creator_id  BIGINT NOT NULL,
  ymd         DATE   NOT NULL,
  seconds     INT    NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL,
  updated_at  DATETIME NOT NULL,
  UNIQUE KEY uq_listen (user_id, creator_id, ymd),
  KEY idx_creator_ymd (creator_id, ymd)
);

-- L1: 크리에이터 적립 잔액 (1행/크리에이터)
CREATE TABLE creator_balance (
  creator_id  BIGINT PRIMARY KEY,
  balance     BIGINT NOT NULL DEFAULT 0,   -- 원, (적립 누적 − 출금)
  updated_at  DATETIME NOT NULL
);

-- L1: 적립·출금 원장 (감사 추적)
CREATE TABLE creator_ledger (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  creator_id    BIGINT NOT NULL,
  type          VARCHAR(20) NOT NULL,      -- ACCRUAL | PAYOUT | ADJUST
  amount        BIGINT NOT NULL,           -- +적립 / −출금
  balance_after BIGINT NOT NULL,
  ref           VARCHAR(100),              -- 예: '2026-06' (적립월) / payout_request_id
  created_at    DATETIME NOT NULL,
  KEY idx_creator (creator_id, created_at)
);

-- L2: 정산(출금) 신청
CREATE TABLE payout_request (
  id              BIGINT AUTO_INCREMENT PRIMARY KEY,
  creator_id      BIGINT NOT NULL,
  settlement_type VARCHAR(20) NOT NULL,    -- 신청 시점 유형 스냅샷 (INDIVIDUAL | BUSINESS)
  amount          BIGINT NOT NULL,         -- 신청 총액(세전)
  withholding     BIGINT NOT NULL,         -- 원천징수액 (개인 3.3% / 사업자 0)
  net_amount      BIGINT NOT NULL,         -- 실지급액
  tax_invoice     BOOLEAN NOT NULL DEFAULT FALSE, -- 사업자: 세금계산서 역발행 대상 여부
  status          VARCHAR(20) NOT NULL,    -- REQUESTED | APPROVED | PAID | REJECTED
  requested_at    DATETIME NOT NULL,
  processed_at    DATETIME,
  paid_at         DATETIME,
  KEY idx_creator (creator_id, requested_at),
  KEY idx_status (status)
);
```

---

## 3. L0 — 청취시간 기록 (전제)

### 3-1. 수집 엔드포인트

```
POST /api/listening/heartbeat          (User 인증 필요)
Body: { "creatorId": 10, "seconds": 60 }   // 직전 비트 이후 누적 재생 델타
200 OK (본문 없음)
```

- **클라이언트**: `<audio>` 재생시간을 누적했다가 **5분(300초)마다 또는 일시정지·트랙변경·페이지이탈 시** 델타 전송. 이탈 시엔 `navigator.sendBeacon` 사용.
  - 간격을 길게 잡아 요청 수를 줄인다(비용 절감). 짧은 세션·중간 이탈은 일시정지/이탈 이벤트의 sendBeacon으로 보정되므로 데이터 손실은 미미하다.
  - 누적은 **wall-clock이 아니라 `audio.currentTime` 기반 재생 델타**로 계산 → 백그라운드 탭 타이머 throttling과 무관하게 실제 재생분만 집계.
- **서버 검증(어뷰징 방지)**:
  1. 호출 User에 **오늘 날짜 기준 ACTIVE `UserSubscription`** 존재해야 함 (없으면 무시/204).
  2. `seconds`는 비트당 **0 < s ≤ 360** 로 클램프 (5분 주기 + 지터·재개 여유).
  3. `(user, ymd)` 일일 합계 **64,800초(18h) 상한** 초과분 미반영.
  4. `creatorId`가 실제 트랙 보유 크리에이터인지 확인.
- **저장**: `listening_daily` UPSERT
  ```sql
  INSERT INTO listening_daily(user_id,creator_id,ymd,seconds,created_at,updated_at)
  VALUES (?,?,?,?,now(),now())
  ON DUPLICATE KEY UPDATE seconds = LEAST(seconds + VALUES(seconds), 64800), updated_at = now();
  ```

> 비구독자(미리듣기)·일시정지·비활성 탭은 애초에 전송하지 않으며, 서버에서도 ACTIVE 구독만 인정해 이중 차단.

### 3-2. 엔티티 스케치

```java
@Entity @Table(name = "listening_daily")
public class ListeningDaily extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = IDENTITY) private Long id;
    @Column(nullable=false) private Long userId;
    @Column(nullable=false) private Long creatorId;
    @Column(nullable=false) private LocalDate ymd;
    @Column(nullable=false) private int seconds;
    // 누적은 Repository의 UPSERT 네이티브 쿼리로 처리
}
```

---

## 4. L1 — 월 적립 (스케줄러)

### 4-1. 적립 잡

```
매월 10일 03:00 (@Scheduled / cron) — 전월(1일~말일) 분 확정 적립
```

```java
@Transactional
public void accrueForMonth(YearMonth month) {           // 멱등: ref=month 로 중복 방지
    for (creatorId : creatorRepository.findAllActiveIds()) {
        long sec = listeningDailyRepository.sumSeconds(creatorId, month.start, month.end);
        long won = sec / 3456;                            // 정수 적립 규칙
        if (won <= 0) continue;
        if (ledgerRepository.existsByCreatorAndRef(creatorId, month.toString())) continue; // 멱등
        long after = balanceRepository.add(creatorId, won);
        ledgerRepository.save(ACCRUAL, creatorId, +won, after, month.toString());
    }
}
```

- **멱등성**: `creator_ledger.ref = '2026-06'` 존재 시 재적립 스킵 → 잡 중복 실행 안전.
- **표시 확정**: 이 시점 이후 대시보드 "확정 적립" 갱신. 진행 중인 당월은 "예상 적립"으로 실시간 계산(§6).

---

## 5. L2 — 정산(출금) 신청

### 5-1. 신청 (크리에이터)

```
POST /api/dj/payout/request            (Creator 인증)
Body: { "amount": 50000 }   // 생략 시 잔액 전액
```

검증·처리:
1. `amount`(또는 전액) ≥ **50,000원**, 잔액 이내인지 확인 (미달 시 400 "적립 잔액이 5만원 이상일 때 신청할 수 있습니다").
2. **세금 처리 — `creator.settlementType`으로 분기 (처음부터 구분):**
   - **INDIVIDUAL(개인)**: `withholding = round(amount × 0.033)`, `net = amount − withholding`, `tax_invoice = false`.
   - **BUSINESS(사업자)**: `withholding = 0`, `net = amount`(전액 지급), `tax_invoice = true` → 세금계산서 역발행 대상으로 표시.
     - VAT 처리(공급가액+부가세 별도 지급 여부)는 회계 정책 확정 필요 — 우선 `net = amount`로 두고 세금계산서만 플래그.
   - 신청 시 `creator.settlementType`을 `payout_request.settlement_type`에 **스냅샷**(이후 유형이 바뀌어도 신청 건은 당시 기준 유지).
3. **즉시 차감(중복 출금 방지)**: `balance −= amount`, `creator_ledger(PAYOUT, −amount)` 기록.
4. `payout_request(status=REQUESTED)` 생성.
5. 거절 시 `balance += amount` 환원(ledger ADJUST).

### 5-2. 관리자 처리

```
GET   /api/admin/payout/requests?status=REQUESTED
PATCH /api/admin/payout/requests/{id}/approve   → APPROVED
PATCH /api/admin/payout/requests/{id}/pay        → PAID  (paid_at, 실제 송금 후)
PATCH /api/admin/payout/requests/{id}/reject     → REJECTED (+ 잔액 환원)
```

> 신청 마감 매월 말일 / 지급 익월 15일은 운영 프로세스(관리자가 해당 주기에 일괄 pay). 시스템은 상태 전이만 관리.

---

## 6. L3 — 조회 API (DjRevenueResponse 확장)

```
GET /api/dj/revenue   (Creator 인증)
```
기존 3필드 → 확장:
```java
public record DjRevenueResponse(
    Long thisMonthEstimate,   // 당월 listening_daily 합 / 3456 (실시간 예상)
    Long balance,             // 적립 잔액 (creator_balance)
    Long totalPaid,           // 누적 지급액 (payout PAID 합)
    boolean canRequest,       // balance >= 50000
    Long minPayout,           // 50000 고정
    LocalDate nextPayoutDate  // 익월 15일
) {}
```
> 금액 산식·단가는 응답에 노출하지 않고 **결과 금액만** 내려줌 (정책 비공개 유지).

추가:
```
GET /api/dj/payout/requests   (Creator) — 본인 신청 내역(상태/금액/일자)
```

---

## 7. 정책 상수 (한 곳에서 관리)

```java
public final class SettlementPolicy {
    public static final long SECONDS_PER_WON  = 3456;    // 1.0417원/h
    public static final long MIN_PAYOUT_WON   = 50_000;
    public static final int  DAILY_CAP_SEC    = 64_800;  // 18h
    public static final int  HEARTBEAT_SEC    = 300;     // 프론트 전송 주기 5분
    public static final int  MAX_BEAT_SEC     = 360;     // 비트당 상한(5분+여유)
    public static final double WITHHOLDING_RATE = 0.033; // 개인 사업소득 원천징수
}

// 세금 분기 (settlementType)
long withholding = (type == BUSINESS) ? 0 : Math.round(amount * WITHHOLDING_RATE);
long net         = amount - withholding;
boolean taxInvoice = (type == BUSINESS);
// 지속가능성: 월 환급총액 > 순수익×7% 시 알림 (단가 재검토 트리거)
```

---

## 8. 어뷰징·정합성 가드 요약

| 위협 | 가드 |
|------|------|
| 비구독자 적립 | heartbeat 시 ACTIVE 구독 검증 |
| 봇 무한 재생 | 일 18h 상한, 비트당 90s 클램프 |
| 중복 출금 | 신청 즉시 잔액 차감 + 원장 |
| 적립 잡 중복 실행 | ref(적립월) 멱등 체크 |
| 부동소수 오차 | 초→원 정수 나눗셈(/3456) |
| 거절 환원 누락 | 상태 전이 시 ledger ADJUST 강제 |

---

## 9. 서버 비용 영향

| 항목 | 평가 |
|------|------|
| heartbeat (5분) | 2,000명×8h 기준 ~**19만 req/일** (평균 ~2.2req/s) — 60초 대비 1/5, 기존 EC2 여유 흡수 |
| listening_daily | UPSERT 누적, 행 수 = 사용자×크리에이터×일, 스토리지 소량 |
| 월 적립 잡 | 월 1회 집계, 부하 미미 |
| 신규 인프라 | **불필요** (서버·DB 인스턴스 추가 없음) |

→ **증분 비용 미미.** heartbeat 주기를 5분으로 늘려 요청 수를 60초 대비 1/5로 절감. 원본 비트는 저장하지 않고 일별 집계만 유지.

---

## 10. 단계별 구현 로드맵

| 단계 | 범위 | 산출물 |
|------|------|--------|
| **P1** | L0 청취 기록 | `ListeningDaily` 엔티티/리포지토리(UPSERT), `POST /api/listening/heartbeat`, 프론트 heartbeat(`<audio>` + sendBeacon) |
| **P2** | L1 적립 | `CreatorBalance`/`CreatorLedger`, 월 적립 스케줄러, `GET /api/dj/revenue` 실데이터 |
| **P3** | L2 정산 | `PayoutRequest`, DJ 신청 API, 관리자 승인/지급 API, 원천징수 |
| **P4** | L3 UI | DJ 대시보드 정산 카드(잔액·예상·신청 버튼), 관리자 정산 목록 |

> 각 신규 클래스는 **70% 커버리지 게이트(BRANCH+LINE)** 대상 — 엔티티 검증/서비스/스케줄러 테스트 동반 필요.

---

## 11. 운영 결정 (확정됨)

| 결정 | 확정값 |
|------|--------|
| 적립 확정일 | **매월 10일** (전월분) |
| 출금 차감 시점 | **신청 즉시 차감** (중복 방지) |
| 세금 처리 | **개인/사업자 처음부터 구분** — 개인 3.3% 원천징수 / 사업자 세금계산서 역발행(원천징수 0). `creator.settlementType` 기준 |
| 부분 출금 | **허용(최소 5만원)**, 기본은 전액 |
| 미신청 잔액 | **무기한 이월**(소멸 없음) |
| heartbeat 전송 주기 | **5분(300초)** — 짧은 주기 대신 길게, 이탈·일시정지 시 sendBeacon 보정 |

> 잔여 확정 대기: 사업자 지급 시 **VAT 별도 정산 여부**(회계 정책) — 우선 `net = amount`로 시작.

---

## 변경 이력
| 버전 | 일자 | 내용 |
|------|------|------|
| v1.0 | 2026-06-18 | 최초 설계 — 4계층(기록/적립/신청/조회), 3,456초=1원 정수 규칙 |
