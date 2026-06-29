# 백엔드 개발 요청서 — 2026-06-12

> **작성:** 프론트엔드  
> **수신:** 백엔드 개발자  
> **환경:** `https://dev-api.indpmusic.co.kr`

---

## 배경

Plan A(개인 구독 요금제) 론칭을 위한 신규 기능과, 이에 따른 기존 API 변경 사항을 정리합니다.  
프론트엔드 UI는 완성 상태이며, 아래 API 구현이 완료되면 즉시 연동 가능합니다.

---

## 요청 항목 요약

| # | 항목 | 우선순위 | 비고 |
|---|------|:-------:|------|
| 1 | 이메일 중복 확인 API | 🔴 높음 | 신규 |
| 2 | Plan A 구독 관련 API 변경 | 🔴 높음 | 기존 수정 |
| 6 | DJ 플레이리스트 API (구독자 청취) | 🔴 높음 | 신규 |
| 7 | DJ 로그인 API | 🔴 높음 | 신규 |
| 3 | 크리에이터(DJ) 계정 관리 API | 🟡 중간 | 신규 |
| 5 | DJ 대시보드 API | 🟡 중간 | 신규 |
| 4 | 사용자 유형 통합 (planType 분기) | 🔵 협의 필요 | 큰 변경 |

---

## #1 — 이메일 중복 확인 API

**목적:** Plan A 가입 시 이메일 입력 단계에서 중복 여부를 실시간 확인

### 엔드포인트

```
GET /api/user/check-email?email={email}
```

인증 불필요.

### 응답

| 상황 | HTTP 상태 |
|------|----------|
| 사용 가능 | `200 OK` |
| 이미 사용 중 | `409 Conflict` + `{ "message": "..." }` |

### 연동 위치

`apply.html` — 이메일 입력 옆 "중복 확인" 버튼

---

### Plan A 신청 흐름 전체

Plan A는 매장 정보 입력 없이 **계정 생성 → 결제** 2단계만 진행합니다.

**1단계 `apply.html` — 계정 생성**

| 필드 | 타입 | 비고 |
|------|------|------|
| 성함 | text | |
| 이메일 | email | 중복 확인 버튼 |
| 비밀번호 | password | 8자 이상 |
| 비밀번호 확인 | password | 프론트 검증만, 서버 미전송 |

**2단계 `payment.html` — 결제**

| 필드 | 비고 |
|------|------|
| 결제 주기 | 월간(1개월) / 연간(12개월) |
| 이용약관 동의 | 체크박스 |

**`POST /api/stores/applications` body (Plan A)**

```json
{
  "applicantName": "홍길동",
  "applicantPhone": "",
  "inquiryContent": "",
  "planId": 3,
  "usagePeriod": 1,
  "serviceStartDate": "2026-06-12",
  "name": "", "industry": "", "address": "",
  "businessHours": {}, "photoUrls": [],
  "platform": "", "playedMusic": "", "customerAgeGroup": "",
  "playMethods": [], "vibes": [], "lighting": 3,
  "playlistType": "", "timePreferences": [],
  "mood": "", "musicTempo": "",
  "preferenceGenres": [], "rejectedSongNote": ""
}
```

> **확인 요청:** `email`, `password` 필드를 위 body에 포함할지, 별도 계정 생성 API로 처리할지 방식 확정 필요합니다.

---

## #2 — Plan A 구독 관련 API 변경

### 2-1. 결제 주기 변경

기존 4종(1/3/6/12개월) → **월간 / 연간** 2종으로 변경되었습니다.

| 선택 | 금액 | `usagePeriod` 전송값 |
|------|------|---------------------|
| 월간 | 4,400원 | `1` |
| 연간 | 52,800원 | `12` |

### 2-2. 서비스 종료일 계산 기준 변경 요청

프론트엔드는 달력 기준 정확한 월 단위로 종료일을 계산합니다.  
백엔드도 `30일 × N` 방식이 아닌 달력 기준 월 단위로 맞춰주세요.

| 선택 | 시작일 | 종료일 |
|------|--------|--------|
| 월간 | 2026-06-12 | 2026-07-11 (1개월 후 -1일) |
| 연간 | 2026-06-12 | 2027-06-11 (12개월 후 -1일) |

### 2-3. `GET /api/user/subscription` — `usagePeriod` 필드 추가

마이페이지에서 월간/연간 구분 표시를 위해 필요합니다.

**기대 응답:**
```json
{
  "planName": "Plan A 라이트 요금제",
  "monthlyRate": 4400,
  "usagePeriod": 1,
  "startDate": "2026-06-12",
  "endDate": "2026-07-11"
}
```

### 2-4. `GET /api/user/payments` 기대 응답

```json
{
  "payments": [
    {
      "planName": "Plan A 라이트 요금제",
      "amount": 4400,
      "paidAt": "2026-06-12"
    }
  ]
}
```

### 2-5. Plan A vs Plan B/C 마이페이지 차이 (참고)

| 항목 | Plan A (구독자) | Plan B/C (매장 관리자) |
|------|---------------|----------------------|
| 인증 토큰 | `userToken` | `ownerToken` |
| 식별 정보 | 이메일 | 매장명 |
| 구독료 표시 | 월간/연간 동적 표시 | API 응답값 |
| 갱신 방식 | 만료 후 수동 갱신 | `renew.html` |
| 서비스 시작일 | 결제 즉시 | 다음 주 화요일 |
| 환불 기준 | 7일 이내 미이용 전액 환불 | 이용 주차 기준 환불 |
| DJ 플레이리스트 청취 | 무제한 | 없음 |
| 비선호 장르 설정 | 없음 | Plan C만 |

---

## #3 — 크리에이터(DJ) 계정 관리 API

**목적:** 어드민 대시보드에서 Plan A용 크리에이터(DJ) 계정을 생성·조회·비활성화

### 3-1. 크리에이터 계정 생성

```
POST /api/admin/creators
Authorization: Bearer {adminToken}
Content-Type: application/json
```

**Request body:**
```json
{
  "name": "박완",
  "djName": "DJ Parkwan",
  "phone": "010-0000-0000",
  "email": "dj@example.com",
  "password": "••••••••"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| `name` | string | Y | 실명 |
| `djName` | string | Y | 활동명 (플랫폼 표시) |
| `phone` | string | Y | 010-xxxx-xxxx |
| `email` | string | Y | 로그인 ID |
| `password` | string | Y | 8자 이상 |

**응답:**

| 상황 | HTTP 상태 |
|------|----------|
| 생성 성공 | `201 Created` |
| 이메일 중복 | `409 Conflict` + `{ "message": "..." }` |

---

### 3-2. 크리에이터 목록 조회

```
GET /api/admin/creators
Authorization: Bearer {adminToken}
```

**기대 응답:**
```json
{
  "creators": [
    {
      "id": 1,
      "name": "박완",
      "djName": "DJ Parkwan",
      "phone": "010-0000-0000",
      "email": "dj@example.com",
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "createdAt": "2026-06-12T00:00:00Z",
      "active": true,
      "isLive": true,
      "listenerCount": 23,
      "trackCount": 100,
      "totalListenMinutes": 4800,
      "subscriberCount": 50,
      "thisMonthEstimate": 38800,
      "totalPaid": 116400
    }
  ]
}
```

| 필드 | 타입 | 설명 | 표시 위치 |
|------|------|------|---------|
| `thumbnailUrl` | string\|null | 썸네일 URL | 목록 + 상세 드로어 |
| `isLive` | boolean | 현재 라이브 여부 | 목록 배지 |
| `listenerCount` | number | 현재 청취자 수 | 목록 + 상세 |
| `trackCount` | number | 업로드 트랙 수 | 목록 + 상세 |
| `totalListenMinutes` | number | 누적 청취 시간(분) | 상세 (시간 환산) |
| `subscriberCount` | number | 구독자 수 | 상세 |
| `thisMonthEstimate` | number\|null | 이번 달 예상 정산(원) | 상세 |
| `totalPaid` | number\|null | 누적 정산 금액(원) | 상세 |

> **협의:** `totalListenMinutes`, `subscriberCount` 등 집계 비용이 큰 필드는 목록 API와 상세 API를 분리하는 방식도 가능합니다.

---

### 3-3. 크리에이터 상세 조회 (목록/상세 분리 시)

```
GET /api/admin/creators/{creatorId}
Authorization: Bearer {adminToken}
```

응답 구조는 3-2의 단일 객체와 동일.

---

### 3-4. 크리에이터 계정 비활성화

```
PATCH /api/admin/creators/{creatorId}/deactivate
Authorization: Bearer {adminToken}
```

**응답:** `200 OK`

---

**어드민 상세 드로어 표시 항목:**

| 섹션 | 표시 항목 |
|------|---------|
| 프로필 | 썸네일, 크리에이터명, 이메일, 성명, 휴대폰, 생성일, 활성 상태 |
| 라이브 현황 | ON/OFF, 청취자 수, 트랙 수, 누적 청취 시간, 구독자 수 |
| 정산 현황 | 이번 달 예상 수익, 누적 정산 금액 |

---

## #4 — 사용자 유형 통합 (협의 필요)

**배경:** 현재 구독자(Plan A)와 매장 관리자(Plan B/C)가 완전히 별도 사용자 유형으로 분리되어 있습니다. 단일 사용자 유형으로 통합하고 `planType`으로만 기능을 구분하는 구조 변경을 요청합니다.

### 4-1. 현재 구조

| 항목 | 매장 관리자 | 구독자 |
|------|-----------|--------|
| 로그인 | `POST /api/owner/login` | `POST /api/user/login` |
| 토큰 갱신 | `POST /api/auth/refresh` | 미구현 |
| 토큰 키 | `ownerToken` | `userToken` |

---

### 4-2. 요청 구조

**통합 로그인 엔드포인트:**

```
POST /api/auth/login
Content-Type: application/json

{
  "loginId": "user@example.com",
  "password": "••••••••"
}
```

**응답:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "planType": "PLAN_A",
  "storeId": null
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `accessToken` | string | JWT |
| `refreshToken` | string | 갱신 토큰 |
| `planType` | string | `PLAN_A` / `PLAN_B` / `PLAN_C` / `DJ` |
| `storeId` | number\|null | Plan B/C만 반환, 나머지 `null` |

**토큰 갱신:**
```
POST /api/auth/refresh
{ "refreshToken": "eyJ..." }
→ { "accessToken": "...", "refreshToken": "..." }
```

---

### 4-3. 프론트엔드 후속 작업 (백엔드 완료 후 진행)

- `ownerToken` / `userToken` → 단일 `token` + `planType` 교체
- 로그인 후 `planType` 기반 리다이렉트:
  - `PLAN_A` → `playlist.html?tab=dj`
  - `PLAN_B`, `PLAN_C` → `playlist.html`
  - `DJ` → `dj-dashboard.html`
- 마이페이지, 재생 권한, 네비게이션 인증 전면 수정

> **협의 요청:** 사용자 테이블 완전 통합 vs 공통 auth 레이어 추가 중 방향 확정 후 진행하겠습니다. 기존 `/api/owner/**` 엔드포인트 유지 여부도 확정 필요합니다.

---

## #5 — DJ 대시보드 API

**목적:** DJ 크리에이터가 프로필 관리, 트랙 업로드/관리, 라이브 ON/OFF, 정산 조회를 할 수 있는 대시보드.  
프론트 UI 완성 상태 — API 연동만 남은 상태입니다.

---

### 5-1. DJ 프로필 조회

```
GET /api/dj/profile
Authorization: Bearer {djToken}
```

```json
{
  "djName": "DJ Parkwan",
  "name": "박완",
  "phone": "010-0000-0000",
  "email": "dj@example.com",
  "thumbnailUrl": "https://cdn.../thumb.jpg"
}
```

| 필드 | 사용 위치 |
|------|---------|
| `djName` | 대시보드 상단, 프로필 수정 모달 |
| `name`, `phone`, `email` | 모달 내 읽기 전용 표시 |
| `thumbnailUrl` | 프로필 썸네일 (없으면 기본 아이콘) |

---

### 5-2. DJ 프로필 수정

수정 가능: `djName`, 썸네일 / 수정 불가: 성명, 휴대폰, 이메일

```
PATCH /api/dj/profile
Authorization: Bearer {djToken}
Content-Type: multipart/form-data

djName: "DJ Parkwan"
thumbnail: [File] (선택)
```

> **협의 요청:** 썸네일을 multipart로 함께 받을지, `POST /api/dj/thumbnail` 별도 API로 분리할지 확정 필요합니다.

---

### 5-3. 비밀번호 변경

```
PATCH /api/dj/password
Authorization: Bearer {djToken}
Content-Type: application/json

{
  "currentPassword": "••••••••",
  "newPassword": "••••••••"
}
```

| 상황 | 응답 |
|------|------|
| 성공 | `200 OK` |
| 현재 비밀번호 불일치 | `400` / `401` + `{ "message": "..." }` |

---

### 5-4. 트랙 목록 조회

```
GET /api/dj/tracks
Authorization: Bearer {djToken}
```

```json
{
  "tracks": [
    { "id": 1, "filename": "morning_haze.mp3", "duration": "3:42", "secs": 222 }
  ]
}
```

> `status` 필드 불필요. 프론트는 업로드 완료된 트랙만 표시합니다.

---

### 5-5. 트랙 업로드

```
POST /api/dj/tracks
Authorization: Bearer {djToken}
Content-Type: multipart/form-data

file: [MP3/WAV, 최대 50MB]
```

**완료 응답:**
```json
{ "id": 101, "filename": "new_track.mp3", "duration": "3:45", "secs": 225 }
```

---

### 5-6. 트랙 삭제

```
DELETE /api/dj/tracks/{trackId}
Authorization: Bearer {djToken}
```

**응답:** `200 OK`

> 삭제 호출은 프론트의 **"적용하기"** 버튼 클릭 시점에 실행됩니다.

---

### 5-7. 라이브 트랙 목록 적용

"적용하기" 버튼 클릭 시 호출. 현재 라이브 재생 큐를 교체합니다.

```
PUT /api/dj/live/tracks
Authorization: Bearer {djToken}
Content-Type: application/json

{ "trackIds": [1, 2, 3, 5, 7] }
```

**응답:** `200 OK`

---

### 5-8. 라이브 시작

```
POST /api/dj/live/start
Authorization: Bearer {djToken}
```

**응답:** `200 OK`  
조건: 업로드 완료 트랙 1개 이상

---

### 5-9. 라이브 종료

```
POST /api/dj/live/stop
Authorization: Bearer {djToken}
```

**응답:** `200 OK`

종료 트리거 3가지:
1. "방송 종료" 버튼 클릭
2. 페이지 닫기/새로고침 (`pagehide` 이벤트 자동 호출)
3. 타 페이지 플로팅 바의 "방송 종료" 버튼

---

### 5-10. 실시간 시청자 수

```
GET /api/dj/live/listeners
Authorization: Bearer {djToken}
```

**응답:** `{ "count": 47 }`

> WebSocket / SSE 방식 push도 협의 가능합니다.

---

### 5-11. 정산 내역 조회

```
GET /api/dj/revenue
Authorization: Bearer {djToken}
```

```json
{
  "thisMonthEstimate": 38800,
  "totalPaid": 116400,
  "nextPayoutDate": "2026-07-10"
}
```

> 현재 정산 정책 미확정으로 프론트는 `—` 표시 중입니다. 정책 확정 후 연동 예정.

---

### 5-12. 현재 구현 상태

| 기능 | 프론트 상태 | 필요 API |
|------|-----------|---------|
| 프로필 표시 | UI 완료 (localStorage 임시) | `GET /api/dj/profile` |
| 크리에이터명 수정 | UI 완료 | `PATCH /api/dj/profile` |
| 썸네일 수정 | UI 완료 | 업로드 방식 협의 필요 |
| 비밀번호 변경 | UI 완료 | `PATCH /api/dj/password` |
| 트랙 목록 | UI 완료 (비어있는 상태) | `GET /api/dj/tracks` |
| 트랙 업로드 | UI + 진행률 바 완료 | `POST /api/dj/tracks` |
| 트랙 삭제 | UI 완료 | `DELETE /api/dj/tracks/{id}` |
| 변경사항 적용 | UI 완료 | `PUT /api/dj/live/tracks` |
| 라이브 시작/종료 | UI 완료 | `POST /api/dj/live/start`, `/stop` |
| 페이지 닫기 자동 종료 | 완료 (`pagehide`) | `POST /api/dj/live/stop` |
| 시청자 수 | UI 완료 | `GET /api/dj/live/listeners` 또는 SSE |
| 정산 내역 | `—` 표시 중 | `GET /api/dj/revenue` (정책 확정 후) |

---

### 5-13. 스토리지 및 스트리밍 아키텍처 권장 사항

MP3를 AWS S3에서 직접 스트리밍하면 청취자가 늘수록 전송 비용이 급증합니다.

| 조건 | AWS S3+CloudFront | Cloudflare R2 |
|------|------------------|--------------|
| 크리에이터 1명 · 청취자 50명 (월) | 약 **224,000원** | 약 **2,000원** |
| 크리에이터 10명 · 청취자 50명씩 (월) | 약 **220만원** | 약 **20,000원** |

**권장 아키텍처: Cloudflare R2 + Workers**

```
[DJ 업로드] → [백엔드] → [Cloudflare R2]
                               ↓
                    [Cloudflare Worker] ← djToken / userToken 검증
                               ↓
                         [청취자 브라우저]  (전송 비용 $0)
```

R2는 AWS S3와 API 완전 호환 — 엔드포인트와 키만 교체하면 됩니다.

```python
# 기존 (AWS S3)
s3 = boto3.client('s3', endpoint_url='https://s3.amazonaws.com', ...)

# 변경 후 (Cloudflare R2)
s3 = boto3.client('s3', endpoint_url='https://{account_id}.r2.cloudflarestorage.com', ...)
```

| 작업 | 난이도 |
|------|--------|
| R2 버킷 생성 | 매우 낮음 |
| 백엔드 스토리지 엔드포인트 교체 | 낮음 |
| Cloudflare Worker 작성 (토큰 검증 + 파일 서빙) | 중간 |
| 트랙 재생 URL을 Worker 엔드포인트로 반환 | 낮음 |

> **주의:** R2 파일을 퍼블릭 URL로 직접 노출하면 egress 비용이 발생합니다. 반드시 Worker를 통해 서빙해야 무료 egress가 적용됩니다.

---

## #6 — DJ 플레이리스트 API (구독자 청취)

**목적:** Plan A 구독자가 DJ 채널 목록을 보고 실시간 방송을 청취하는 API.  
비구독자는 라이브 채널에 한해 30초 미리 듣기만 가능합니다.

---

### 6-1. DJ 채널 목록 조회

```
GET /api/dj/playlists
```

인증 불필요. 프론트는 `isLive: true`인 항목만 필터링해서 표시합니다.

```json
{
  "playlists": [
    { "id": 1, "name": "새벽 감성 세트", "djName": "DJ Parkwan", "emoji": "🌙", "isLive": true },
    { "id": 2, "name": "오후 힙합 믹스", "djName": "DJ Miso",    "emoji": "🎧", "isLive": false }
  ]
}
```

---

### 6-2. DJ 채널 상세 조회

```
GET /api/dj/playlists/{plId}
```

인증 불필요. 프론트가 응답 수신 후 토큰 존재 여부로 전체 재생/미리 듣기를 분기합니다.

```json
{
  "id": 1,
  "name": "새벽 감성 세트",
  "djName": "DJ Parkwan",
  "emoji": "🌙",
  "isLive": true,
  "listeners": 23,
  "currentIdx": 2,
  "tracks": [
    { "id": 1, "filename": "morning_haze.mp3", "duration": "3:42", "secs": 222, "streamUrl": "https://..." },
    { "id": 2, "filename": "soft_reset.mp3",   "duration": "3:55", "secs": 235, "streamUrl": "https://..." }
  ]
}
```

| 필드 | 설명 |
|------|------|
| `isLive` | `false`면 "대기 중" 화면, 재생 없음 |
| `currentIdx` | 현재 재생 중인 트랙 인덱스 |
| `streamUrl` | 오디오 스트리밍 URL (Cloudflare Worker 경유 권장 — #5-13 참고) |

**접근 제어:**

| 사용자 상태 | `isLive: false` | `isLive: true` |
|------------|----------------|----------------|
| 비로그인 | 대기 중 화면 | 30초 미리 듣기 후 구독 유도 |
| 로그인 (Plan A / B / C / DJ) | 대기 중 화면 | 전체 재생 |

> **협의 요청:** `streamUrl`을 공개 API 응답에 포함하면 비구독자도 URL 직접 접근이 가능합니다. Worker에서 토큰 검증 후 서빙하는 방식을 권장합니다.

---

### 6-3. 현재 구현 상태

| 기능 | 프론트 상태 | 필요 API |
|------|-----------|---------|
| DJ 채널 목록 | UI 완료 | `GET /api/dj/playlists` |
| 채널 상세 / 트랙 목록 | UI 완료 | `GET /api/dj/playlists/{plId}` |
| 30초 미리 듣기 | UI + 타이머 완료 | 별도 API 불필요 |
| 오디오 실제 재생 | 파형 애니메이션만 구현 | `streamUrl` 구현 후 연동 |

---

## #7 — DJ 로그인 API

**목적:** DJ 크리에이터가 이메일/비밀번호로 로그인하여 DJ 대시보드에 접근.

### 7-1. 엔드포인트

```
POST /api/dj/login
Content-Type: application/json

{
  "email": "dj@example.com",
  "password": "••••••••"
}
```

**응답:**
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "djName": "DJ Parkwan",
  "djId": 1
}
```

| 상황 | HTTP 상태 |
|------|----------|
| 성공 | `200 OK` |
| 이메일/비밀번호 불일치 | `401` + `{ "message": "..." }` |
| 비활성화된 계정 | `403` + `{ "message": "..." }` |

---

### 7-2. 프론트 연동 흐름

`login.html`에서 이메일 입력 시 순서대로 시도합니다:

1. `POST /api/user/login` (Plan A 구독자)
2. 실패 시 → `POST /api/dj/login` (DJ)
3. 실패 시 → `POST /api/owner/login` (매장 관리자)

로그인 성공 후 `localStorage`에 `djToken`, `djName` 저장 → `dj-dashboard.html` 리다이렉트.

---

### 7-3. #4 통합 로그인과의 관계

#4 통합 엔드포인트(`POST /api/auth/login`)에서 DJ도 함께 처리한다면, 응답에 `planType: "DJ"` 추가로 대응 가능합니다.

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "planType": "DJ",
  "djName": "DJ Parkwan",
  "djId": 1
}
```

> **협의 요청:** `POST /api/dj/login` 별도 운영 vs `POST /api/auth/login` 통합 처리 방향 확정 부탁드립니다.

---

## 전체 API 목록

| 메서드 | 엔드포인트 | 섹션 | 신규/변경 |
|--------|-----------|------|:--------:|
| GET | `/api/user/check-email?email=` | #1 | 신규 |
| POST | `/api/stores/applications` | #1 | 변경 (email/password 필드 확인 필요) |
| GET | `/api/user/subscription` | #2 | 변경 (usagePeriod 추가) |
| GET | `/api/user/payments` | #2 | 확인 |
| POST | `/api/admin/creators` | #3 | 신규 |
| GET | `/api/admin/creators` | #3 | 신규 |
| GET | `/api/admin/creators/{id}` | #3 | 신규 (선택) |
| PATCH | `/api/admin/creators/{id}/deactivate` | #3 | 신규 |
| POST | `/api/auth/login` | #4 | 신규 (협의) |
| POST | `/api/auth/refresh` | #4 | 기존 (userToken 쪽 미구현) |
| GET | `/api/dj/profile` | #5 | 신규 |
| PATCH | `/api/dj/profile` | #5 | 신규 |
| PATCH | `/api/dj/password` | #5 | 신규 |
| GET | `/api/dj/tracks` | #5 | 신규 |
| POST | `/api/dj/tracks` | #5 | 신규 |
| DELETE | `/api/dj/tracks/{id}` | #5 | 신규 |
| PUT | `/api/dj/live/tracks` | #5 | 신규 |
| POST | `/api/dj/live/start` | #5 | 신규 |
| POST | `/api/dj/live/stop` | #5 | 신규 |
| GET | `/api/dj/live/listeners` | #5 | 신규 |
| GET | `/api/dj/revenue` | #5 | 신규 |
| GET | `/api/dj/playlists` | #6 | 신규 |
| GET | `/api/dj/playlists/{plId}` | #6 | 신규 |
| POST | `/api/dj/login` | #7 | 신규 |
