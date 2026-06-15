# 프론트엔드 변경 명세 — Plan A 라이트 도입 이후 전체

> 기준 시점: 커밋 `e39ee9c` (DJ 기능 추가 및 플레이리스트·요금제 페이지 전면 개편)  
> 최종 업데이트: 2026-06-05  
> 브랜치: `dev`  
> 대상 독자: 백엔드 개발자, 서비스 기획자

---

## 1. 개요

Plan A 라이트 요금제 도입과 함께 아래 기능 및 페이지가 신규 추가·변경되었습니다.

| 구분 | 내용 |
|------|------|
| 신규 요금제 | Plan A 라이트 (월 4,400원, DJ 플레이리스트 전용 구독) |
| 신규 인증 흐름 | 구독자(Plan A) 이메일/비밀번호 로그인 |
| 신규 페이지 | `dj-playlist-detail.html`, `dj-dashboard.html` |
| 기존 페이지 개편 | `login.html`, `plan.html`, `playlist.html`, `playlist-detail.html`, `mypage.html`, `apply-music.html`, `payment.html` |
| 어드민 전면 개편 | `admin-dashboard.html` — 음원 매핑, 랜덤 플리 생성, 음원 데이터 관리, 모바일 반응형 |
| 공통 모듈 개선 | `api.js` — 토큰 자동 갱신 강화, 모바일 네비게이션 |
| 기술 개선 | favicon 다중 사이즈 선언, SEO 개선 |

---

## 2. 사용자 유형 및 인증 체계

프론트엔드는 세 가지 인증 주체를 `localStorage`로 구분합니다.

| 주체 | localStorage 키 | 설명 |
|------|----------------|------|
| 매장 관리자 | `ownerToken`, `ownerRefreshToken`, `ownerStoreId` | 기존 유지 |
| Plan A 구독자 | `userToken`, `userRefreshToken`, `userEmail` | 신규 |
| DJ | `djToken`, `djName`, `djGenre` | 신규 (현재 데모용) |

세 토큰은 완전히 독립적이며 동시에 존재할 수 있습니다. 각 페이지는 우선순위에 따라 분기합니다.

**우선순위:** `ownerToken` > `djToken` > `userToken`

---

## 3. 페이지별 변경 상세

### 3-1. `login.html` — 로그인 페이지

**변경 사항:**
- 탭 순서 변경: `구독자 로그인`이 기본(첫 번째) 탭 (기존: 매장 관리자 탭이 기본)
- 매장 관리자 탭 직접 진입 URL: `login.html?mode=owner`

**구독자 로그인 흐름:**
```
이메일 + 비밀번호 입력
→ POST /api/user/login
→ userToken, userRefreshToken 저장
→ localStorage.userEmail = 요청 이메일
→ playlist.html?tab=dj 이동
```

**매장 관리자 로그인 흐름 (변경 없음):**
```
아이디 + 비밀번호 입력
→ POST /api/owner/login
→ ownerToken, ownerRefreshToken 저장
→ GET /api/owner/stores → ownerStoreId 저장
→ playlist.html 이동
```

---

### 3-2. `plan.html` — 요금제 선택 페이지

**변경 사항:**
- Plan A 라이트 카드 신규 추가 (하드코딩, `GET /api/plans` 응답과 무관)
- `selectPlan('A', 3, 4400)` 호출 시 `localStorage.selectedPlan = 'A'`, `selectedPlanId = 3` 저장

**planId 매핑:**

| Plan | planId | 월 요금 | 서비스 시작일 |
|------|--------|---------|------------|
| Plan A 라이트 | `3` | 4,400원 | 결제 당일 즉시 |
| Plan B 기본 | `1` | API 응답값 | 다음 주 화요일 |
| Plan C 프리미엄 | `2` | API 응답값 | 다음 주 화요일 |

> Plan A는 `GET /api/plans` 응답에 포함되지 않아 프론트엔드에서 하드코딩 처리 중.

---

### 3-3. `apply-store.html` / `apply-music.html` / `payment.html` — 도입 문의 흐름

#### Plan별 노출 필드 (`apply-music.html`)

| 입력 필드 | Plan A | Plan B | Plan C |
|----------|:------:|:------:|:------:|
| 주요 재생 음악 | ✓ | ✓ | ✓ |
| 주 고객 연령대 | ✓ | ✓ | ✓ |
| 음악 재생 방식 | ✓ | ✓ | ✓ |
| 매장 분위기 (vibe) | ✓ | ✓ | ✓ |
| 조명 색온도 | ✓ | ✓ | ✓ |
| 음악 템포 | ✓ | ✓ | ✓ |
| 음악 재생 설정 | ✓ | ✓ | ✓ |
| 추천 거부 장르 | ✗ | ✗ | ✓ |
| 이런 곡은 받고 싶지 않아요 | ✗ | ✗ | ✓ |

#### Plan A 결제 동작 (`payment.html`)
- 서비스 시작일: "결제 완료 즉시 서비스가 시작됩니다."
- 구독 기간 계산: 월 단위 (1개월 = 30일)
- QR 리플렛 배송 안내: 미표시 (Plan C 전용)

#### 최종 API 요청 (`POST /api/stores/applications`) 차이점

| 필드 | Plan A 라이트 | Plan B 기본 | Plan C 프리미엄 |
|------|-------------|------------|----------------|
| `planId` | `3` | `1` | `2` |
| `serviceStartDate` | 결제 당일 | 다음 주 화요일 | 다음 주 화요일 |
| `rejectGenres` | 항상 `[]` | 항상 `[]` | 사용자 입력값 |
| `rejectedSongNote` | 항상 `""` | 항상 `""` | 사용자 입력값 |

> **미해결:** 도입 문의 매장 사진 업로드 완전 미동작. `apply-store.html` 파일 선택 후 업로드 없음, `payment.html`에서 `photoUrls: []` 하드코딩으로 전송 중.

---

### 3-4. `playlist.html` — 플레이리스트 목록 페이지

#### DJ 탭 추가
- "DJ 플레이리스트" 탭 신규 추가 (기존: 브랜드 플레이리스트 탭만 존재)
- URL 파라미터: `playlist.html?tab=dj` → DJ 탭으로 직접 진입 (구독자 로그인 후 리디렉션 경로)

**DJ 플레이리스트 카드 표시 정보:**
- 플레이리스트 이름, DJ 이름
- LIVE / 대기 중 상태 배지
- 장르 태그, 트랙 수는 **의도적으로 제거** (UI 단순화)

현재 `DJ_PLAYLISTS_SAMPLE` 하드코딩 데이터 사용.

#### DJ 대시보드 배너
- DJ 탭 하단(플레이리스트 목록 아래)에 "DJ 플레이리스트 관리" 배너 항상 노출
- 미로그인 상태: "DJ 대시보드 입장" 클릭 시 `login.html?mode=owner`로 이동
- 로그인 상태 (`djToken` 또는 `ownerToken` 보유): `dj-dashboard.html`로 이동
- 기존: `djToken` 보유 시에만 배너 표시 → 변경: 로그인 여부와 무관하게 항상 표시

---

### 3-5. `playlist-detail.html` — 매장 플레이리스트 상세/재생 페이지

#### 음악 재생 방식 전환 (모바일 무음 문제 해결)
- 기존: `loadVideoById()` 방식 (매 곡마다 개별 로드 → 모바일에서 곡 전환 시 음소거 발생)
- 변경: `loadPlaylist()` 방식으로 전환 — YouTube 플레이리스트 일괄 로드, 브라우저 자동재생 정책 우회

```js
// 전체 플레이리스트를 한 번에 로드
ytPlayer.loadPlaylist({ playlist: videoIds, index: startIdx, startSeconds: elapsed });
// setLoop(true) 제거 → 하루치 재생 후 완료 배너 표시
```

#### 재생 완료 안내 배너
- 전체 곡 재생 완료 시 (`YT.PlayerState.ENDED`) 무한 루프 대신 완료 화면 전환
- 표시 내용: "오늘 준비된 플레이리스트가 모두 재생되었습니다." + 새로고침 버튼
- 재생 완료 후 `clearInterval(ticker)` 로 불필요한 타이머 중단

#### 세션 만료 안내
- 만료된 `ownerToken`으로 owner API 호출 시 토큰 갱신 실패하면 무음 손님 모드로 떨어지던 문제 개선
- 세션 만료 감지 시 경고 배너 표시: "로그인 세션이 만료되었습니다. 재생을 계속하려면 다시 로그인해 주세요." + 재로그인 링크

#### 탭 비활성화 복구 로직 (`syncFromWallClock`)
- 탭이 백그라운드로 전환되어 `setInterval` 타이머가 throttle된 경우에도 wall clock 기준으로 현재 곡·경과 시간을 재계산하여 정확한 위치에서 재개

---

### 3-6. `dj-playlist-detail.html` — DJ 플레이리스트 상세 (신규)

URL: `dj-playlist-detail.html?id={플레이리스트ID}`

**재생 권한 판별:**
```javascript
const canPlay = !!(getUserToken() || localStorage.getItem('djToken') || getOwnerToken());
```
`userToken`(구독자), `djToken`(DJ), `ownerToken`(매장 관리자) 중 하나라도 있으면 전체 재생 허용.

**상태별 화면:**

| 상태 | 조건 | 표시 |
|------|------|------|
| 대기 중 | `isLive === false` | "현재 재생 중이 아닙니다" 안내 |
| 30초 미리듣기 | `isLive === true` + `canPlay === false` | 파형 애니메이션 + 카운트다운 + CTA |
| 전체 재생 | `isLive === true` + `canPlay === true` | 파형 애니메이션 (실시간 진행 표시) |

**미리듣기 CTA 분기:**
- 미로그인: "로그인" + "구독하기" 버튼 모두 표시
- `ownerToken` 보유 (매장 관리자, 미구독): "구독하기" 버튼만 표시

**의도적으로 제거한 정보:**
- 개별 트랙 목록 (곡명/가수/시간)
- 장르 태그, 총 트랙 수, 총 재생 시간
- NOW PLAYING 레이블에 현재 곡 제목/가수 (파형만 표시)

**레이아웃 순서:** 레코드 이미지 → NOW PLAYING 파형 → 미리듣기/CTA

현재 `dj-playlist-detail.html` 내 `DJ_PLAYLISTS` 하드코딩 데이터 사용.

**백엔드 연동 시 최소 필요 응답 구조:**
```json
{
  "id": 1,
  "name": "플레이리스트명",
  "djName": "DJ명",
  "emoji": "☕",
  "isLive": true,
  "listeners": 47,
  "currentIdx": 3,
  "tracks": [{ "secs": 186 }]
}
```

---

### 3-7. `dj-dashboard.html` — DJ 대시보드 (신규)

**접근 권한:**
```javascript
const djToken = localStorage.getItem('djToken') || getOwnerToken();
// djToken 또는 ownerToken 보유 시 진입 허용, 없으면 접근 거부 화면 표시
```

**현재 상태:** 전체 더미 데이터. 트랙 업로드·라이브 상태 변경 API 미연결.  
라이브 ON/OFF 상태는 `localStorage.djIsLive`로만 관리 (서버 동기화 없음).

**추후 연동 필요 API:**
- `GET /api/dj/tracks` — 내 트랙 목록
- `POST /api/dj/tracks` — 트랙 업로드
- `DELETE /api/dj/tracks/:id` — 트랙 삭제
- `POST /api/dj/live/start` — 라이브 시작
- `POST /api/dj/live/stop` — 라이브 종료

---

### 3-8. `mypage.html` — 마이페이지

**진입 분기 로직 (신규):**
```javascript
if (ownerToken)   → 매장 관리자 마이페이지 (기존)
else if (userToken) → 구독자 마이페이지 (신규)
else              → login.html 리디렉션
```

**구독자 마이페이지 표시 정보 (현재 더미):**

| 항목 | 현재 | 연동 후 |
|------|------|---------|
| 이메일 | `localStorage.userEmail` | 동일 |
| 플랜명 | "Plan A 라이트" 하드코딩 | `GET /api/user/subscription` |
| 구독 기간 | 오늘 ~ 오늘+1개월 | `GET /api/user/subscription` |
| 갱신 예정일 | 오늘+1개월 | `GET /api/user/subscription` |
| 결제 내역 | "준비 중" 안내 | `GET /api/user/payments` |

---

## 4. 어드민 대시보드 (`admin-dashboard.html`) 전면 개편

### 4-1. 사이드바 메뉴 변경

| 변경 전 | 변경 후 |
|---------|---------|
| 매장 관리 | 매장 관리 (유지) |
| 플레이리스트 관리 | 플레이리스트 관리 (유지) |
| ~~랜덤 플리 생성~~ (별도 메뉴) | 제거 → 플레이리스트 관리 탭 내 통합 |
| 음원 데이터 관리 | 음원 데이터 관리 (유지) |

---

### 4-2. 매장 관리 — 드로어 탭 추가

| 탭명 | 설명 |
|------|------|
| 기본 정보 | 기존 유지 |
| 매장 무드 | 기존 유지 |
| 추천곡 관리 | 기존 유지 |
| **음원 매핑** (신규) | 시간대별 무드 매핑 설정 |
| **현재 플리** (신규) | 현재 적용 중인 플레이리스트 조회 |

#### 음원 매핑 탭
- 매장 영업 시간을 파싱하여 **해당 영업 시간대만** 표시 (기존: 24시간 전체)
- 영업 시간 형식: `"월·금요일 09:00 ~ 22:00"` 파싱 → 유효 시간 배열 생성
- 야간 영업(예: 22:00~03:00) 처리 지원
- 시간대별 무드 선택 후 "매핑 저장" → `localStorage('adminMoodSchedule')` 저장

**저장 구조 (`adminMoodSchedule`):**
```json
{
  "매장명A": { "9": "Happy", "10": "Chill", "11": "Happy" },
  "매장명B": { "14": "Jazz" }
}
```

#### 현재 플리 탭
- 탭 진입 시 `GET /api/stores/{storeId}/playlists` 호출
- 응답의 `playlist.songs` 배열을 곡 목록으로 표시
- 곡 수·총 재생 시간 헤더 표시
- 데이터는 랜덤 생성 카드의 `plCurrentSongs` 캐시와 공유

---

### 4-3. 플레이리스트 관리 — 랜덤 생성 모드 통합

기존 엑셀 업로드 전용이었던 탭에 "엑셀 업로드 / 랜덤 생성" 모드 탭이 추가되었습니다.

#### 랜덤 생성 전체 흐름

```
1. 드로어 > 음원 매핑 탭에서 시간대별 무드 사전 설정
2. 적용 시각 설정 (매장별 개별 or 일괄 적용 바)
3. "전체 매장 플리 생성" 버튼 클릭
4. 각 매장의 매핑된 시간대별로 음원 풀에서 18곡 무작위 선택
5. POST /api/admin/scheduled-playlists 일괄 전송
6. 결과: 매장별 아코디언 카드 표시
```

#### 적용 시각(scheduledAt) 처리
- 시간대별 개별 `scheduledAt`이 아닌, **"이 플레이리스트들을 언제부터 적용할지"** 를 나타내는 단일 시각
- 엑셀 업로드와 동일한 방식

**적용 시각 설정 방법:**

| 방법 | 설명 |
|------|------|
| 매장별 개별 설정 | 각 카드의 날짜·시간 입력 (30분 단위 select) |
| 일괄 설정 | 상단 "일괄 적용 시각" 바 → 날짜·시간 → "전체 적용" 클릭 |

#### 버튼 활성화 조건
- 매핑이 설정된 매장이 1개 이상이면 "전체 매장 플리 생성" 버튼 활성화
- 매핑 없는 매장은 건너뜀 (생성 가능)

#### 현재 플리 보기 (카드 내 토글)
- 각 매장 카드 하단 "현재 플리 보기" 토글 버튼
- 첫 클릭에만 `GET /api/stores/{storeId}/playlists` 호출, 이후 캐시 사용

#### API 요청 형식

```
POST /api/admin/scheduled-playlists
Authorization: Bearer {adminToken}

{
  "schedulePlaylists": [
    {
      "storeName": "매장A",
      "scheduledAt": "2026-06-05T09:00:00.000Z",
      "songs": [
        { "title": "곡제목", "artist": "아티스트", "vid": "유튜브ID", "playTime": 240 },
        ...
      ]
    }
  ]
}
```

> `scheduledAt`: 사용자 지정 단일 시각 (모든 항목 동일)  
> `playTime`: 초 단위 정수  
> `mood`, `hour` 필드는 내부 처리용 → API 전송 전 제거됨

#### 결과 카드 아코디언 구조
- 매장명, 적용 시각, N개 시간대·총 M곡·총 재생 시간 표시
- 클릭 시 시간대별 섹션 + 곡 목록 펼침
- 아코디언 CSS `display:flex` 충돌 버그 수정 완료 (`display:block` 오버라이드)

---

### 4-4. 음원 데이터 관리 개편

#### 화면 진입 흐름

| 단계 | 조건 | 표시 |
|------|------|------|
| 초기 | 데이터 없음 | 빈 상태 안내 + 업로드 버튼 |
| 초기 | 데이터 있음 | 요약 화면 ("N개 무드 · M곡") |
| 무드 선택 | 드롭다운에서 선택 | 해당 무드 곡 그리드 |

#### 무드 선택 방식 변경
- 기존: 가로 스크롤 탭 방식
- 변경: `<select>` 드롭다운 방식
- "전체 보기" 선택 시 요약 화면으로 복귀
- 무드 선택 시 곡 수 표시: `Happy (42곡)`

#### 엑셀 업로드/다운로드
- 업로드 바: 항상 최상단 노출 (요약·편집 화면 모두)
- **엑셀 다운로드** 신규 추가 (SheetJS XLSX 0.20.3)
  - 무드별 시트 생성, 시트명 = 무드명
  - 컬럼: 제목 / 가수 / 재생시간 / YouTube ID
  - 파일명: `음원데이터_YYYY-MM-DD.xlsx`
  - 데이터 없으면 버튼 비활성화

#### 곡 입력 그리드 (무드별 인라인 편집)

| 컬럼 | 설명 |
|------|------|
| # | 순서 (자동) |
| 제목 | 곡 제목 (필수) |
| 가수 | 아티스트명 |
| 재생시간 | `mm:ss` 또는 초 단위 |
| YouTube ID | 11자리 vid |
| 삭제 | 행 삭제 버튼 |

**저장 구조 (`adminMusicData_v2`):**
```json
{
  "Happy": [
    { "title": "곡제목", "artist": "아티스트", "playTime": "3:45", "vid": "dQw4w9WgXcQ" }
  ],
  "Chill": []
}
```

---

### 4-5. 어드민 모바일 반응형 개선

#### 768px 이하

| 영역 | 변경 |
|------|------|
| 드로어 | 패딩 축소, 탭 폰트·간격 조정 |
| 플레이리스트 모드 탭 | 전폭 확장, 탭 균등 분할 |
| 엑셀 업로드 일괄 시각 | `flex-wrap` 적용, "전체 적용" 버튼 전폭 |
| 랜덤 생성 일괄 시각 | `flex-wrap` 적용, 시간 select 전폭 |
| 음원 데이터 업로드 바 | 업로드·다운로드 버튼 균등 분할 |
| 무드 드롭다운 | 전폭 확장 |
| 음원 입력 테이블 | 가로 스크롤 처리 |

#### 480px 이하

| 영역 | 변경 |
|------|------|
| page-content 패딩 | 16px → 12px |
| 드로어 탭 폰트 | 12px |
| 업로드/다운로드 버튼 | 각각 전폭 |
| 랜덤 생성 카드 | 패딩 12px, 카드명 폰트 13px |
| 패널 제목 | 16px |

---

## 5. 공통 모듈 (`api.js`) 변경

### 5-1. 신규 추가 함수

```javascript
// 구독자 토큰 관리
function getUserToken()  { return localStorage.getItem('userToken'); }
function setUserToken(accessToken, refreshToken) { ... }
function clearUserToken() { ... }

// DJ 라이브 상태 관리
function setDjLive(on)  { ... }
function isDjLive()     { ... }
function initDjFloatingBar() { ... }  // DJ 라이브 중 플로팅 바 표시
```

### 5-2. 토큰 자동 갱신 강화

**변경 전 (`scheduleSessionWarning`):**
- 만료 5분 전: 타이머 등록
- 이미 갱신 시점 지났지만 유효: 즉시 갱신
- **이미 만료됨: 아무것도 안 함** ← 버그

**변경 후:**
- 만료 5분 전: 타이머 등록
- 이미 갱신 시점 지났거나 만료됨: **즉시 갱신 시도**
- `visibilitychange` 리스너 추가: 탭 동결(Chrome Memory Saver, 모바일 앱 전환) 후 복귀 시 타이머 재등록

**효과:**
- 당일 종일 재생 → 탭 동결 복귀 후에도 자동 갱신 유지
- 다음날 새로고침 → 재로그인 없이 refreshToken으로 자동 갱신 후 재생
- refreshToken 30일 유효 기간 내에서 재로그인 없이 연속 재생 보장
- 모든 기기(PC/포스기/모바일/태블릿) 공통 적용

### 5-3. 네비게이션 로그인 상태 분기

```javascript
function updateNavAuth() {
  if (getOwnerToken())    → 로그아웃 + 마이페이지 (매장 관리자)
  else if (getUserToken()) → 로그아웃 + 마이페이지 (구독자)
  else                    → 로그인 + 도입 문의
}
```

### 5-4. 모바일 햄버거 메뉴 (`initMobileNav`)
- 768px 이하에서 동적으로 햄버거 메뉴 생성
- 로그인 상태에 따라 메뉴 항목 분기

---

## 6. 기술 개선

### 6-1. favicon 다중 사이즈 선언

**변경 전:** 32×32 PNG 단일 선언, `favicon.ico` 없음 (404)  
**변경 후:** 16/32/192/512px 전체 선언, `favicon.ico` 루트에 추가

```html
<link rel="shortcut icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/favicon-512.png" />
```

**효과:** 구글 검색 결과 아이콘 표시 (구글 최소 요구 48px 충족)

---

## 7. localStorage 키 전체 정리

| 키 | 타입 | 설명 |
|----|------|------|
| `ownerToken` | String | 매장 관리자 JWT accessToken |
| `ownerRefreshToken` | String | 매장 관리자 refreshToken (30일) |
| `ownerStoreId` | String | 매장 관리자 매장 ID |
| `userToken` | String | 구독자 JWT accessToken |
| `userRefreshToken` | String | 구독자 refreshToken |
| `userEmail` | String | 구독자 이메일 |
| `djToken` | String | DJ 토큰 (현재 데모용 하드코딩) |
| `djName` | String | DJ 이름 |
| `djGenre` | String | DJ 장르 |
| `djIsLive` | String `"1"` | DJ 라이브 ON 상태 |
| `adminToken` | String | 어드민 JWT 토큰 |
| `adminMusicData_v2` | JSON | 무드별 음원 데이터 `{ moodName: [{title,artist,playTime,vid}] }` |
| `adminMoodSchedule` | JSON | 매장별 시간대 무드 매핑 `{ storeName: { "9": "Happy" } }` |
| `selectedPlan` | String | 선택된 요금제 (`"A"`, `"B"`, `"C"`) |
| `selectedPlanId` | String | 선택된 planId (`"1"`, `"2"`, `"3"`) |

---

## 8. 사용 API 전체 목록

### 현재 연동 완료

| 메서드 | 엔드포인트 | 용도 |
|--------|-----------|------|
| `POST` | `/api/owner/login` | 매장 관리자 로그인 |
| `POST` | `/api/owner/refresh` | 매장 관리자 토큰 갱신 |
| `GET` | `/api/owner/stores` | 매장 관리자 매장 목록 |
| `GET` | `/api/owner/stores/{id}` | 매장 상세 조회 |
| `GET` | `/api/owner/stores/{id}/playlists` | 매장 플레이리스트 (관리자용) |
| `GET` | `/api/owner/stores/{id}/subscriptions` | 구독 정보 |
| `GET` | `/api/owner/payments/stores/{id}` | 결제 내역 |
| `POST` | `/api/user/login` | 구독자 로그인 |
| `POST` | `/api/stores/applications` | 도입 문의 신청 |
| `GET` | `/api/stores` | 전체 매장 목록 |
| `GET` | `/api/stores/{id}/summary` | 매장 요약 정보 |
| `GET` | `/api/stores/{id}/playlists` | 매장 플레이리스트 (공개) |
| `GET` | `/api/stores/{id}/sse` | 실시간 추천곡 수신 (SSE) |
| `GET` | `/api/admin/stores/{id}` | 어드민 매장 상세 |
| `POST` | `/api/admin/scheduled-playlists` | 플레이리스트 일괄 등록 |
| `POST` | `/api/payments/confirm` | 결제 확인 |
| `POST` | `/api/payments/fail` | 결제 실패 처리 |

### 백엔드 연동 대기 (더미/하드코딩 처리 중)

| 우선순위 | 메서드 | 엔드포인트 | 현재 처리 |
|---------|--------|-----------|---------|
| **높음** | — | `planId: 3` 등록 확인 | Plan A 신청이 `planId=3`으로 전송됨 |
| **높음** | `POST` | `/api/user/refresh` | 구독자 토큰 갱신 로직 없음, 만료 시 실패 |
| **중간** | `GET` | `/api/user/subscription` | 구독 정보 하드코딩 |
| **중간** | `GET` | `/api/user/payments` | "준비 중" 안내 문구만 표시 |
| **중간** | `POST` | `/api/stores/images` | 매장 사진 업로드 완전 미동작 |
| **낮음** | `GET` | `/api/dj/playlists` | `DJ_PLAYLISTS_SAMPLE` 하드코딩 |
| **낮음** | `GET` | `/api/dj/playlists/:id` | `DJ_PLAYLISTS` 하드코딩 |
| **낮음** | — | DJ 대시보드 관련 API 전체 | 트랙 업로드, 라이브 ON/OFF 등 |
