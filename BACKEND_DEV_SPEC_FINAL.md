# 백엔드 개발자 전달 문서 — 전체 API 명세 (Plan A 도입 이후)

> 기준 시점: 2026-06-10
> 대상 독자: 백엔드 개발자
> 작성 방식: 프론트엔드 소스(`api.js`, `admin-dashboard.html`, `playlist-detail.html`, `playlist.html`)에서 실제 호출하는 fetch/apiFetch 전수 추출
> Base URL: `https://dev-api.indpmusic.co.kr` (`api.js`의 `BASE_URL` 상수)

이 문서는 프론트엔드 코드를 보지 않고도 각 엔드포인트의 요청/응답 구조와 에러 처리, 인증 흐름을 이해할 수 있도록 작성되었습니다. 모든 JSON 예시의 필드명은 프론트엔드가 **실제로 접근하는** 필드 기준입니다.

---

## 0. 공통 사항

### 0-1. 공통 HTTP 클라이언트 (`apiFetch`)

거의 모든 호출은 `api.js`의 `apiFetch(method, path, body, token)`를 거칩니다. 동작 규약은 다음과 같습니다.

| 항목 | 동작 |
|------|------|
| Content-Type | 항상 `application/json` |
| Authorization | `token` 인자가 있으면 `Authorization: Bearer {token}` 추가, 없으면 미부착 (= 비인증 public 호출) |
| Body | `body`가 `undefined`가 아니면 `JSON.stringify`하여 전송 |
| 401 응답 | `refreshAccessToken()` 호출 후 **갱신 성공 시 1회 재시도**, 실패 시 `Error('세션이 만료되었습니다.')` throw |
| 204 No Content | `null` 반환 |
| 빈 본문 | `null` 반환 |
| 그 외 에러 | 응답 JSON의 `message` 필드를 에러 메시지로 사용. 없으면 `API 오류 (${status})` |

> **중요:** 401 재시도 로직은 **매장 관리자(owner) 토큰 전용**입니다(0-2 참조). 재시도 시 `getOwnerToken()`으로 새 토큰을 가져옵니다. 따라서 `adminToken`/`userToken`으로 호출한 API가 401을 받으면, 프론트는 owner refresh를 시도하고(대개 실패) 세션 만료 에러를 던집니다.

### 0-2. 일부 호출은 `apiFetch`를 우회

다음 호출은 `apiFetch`가 아니라 `fetch`를 직접 사용하므로 401 자동 재시도/공통 에러 처리가 **적용되지 않습니다.**

| 호출 | 위치 | 비고 |
|------|------|------|
| `POST /api/owner/refresh` | `api.js` `refreshAccessToken()` | 토큰 갱신 자체 |
| `GET /api/stores/{id}/playlists` | `playlist.html` `checkPlaying()` | 재생중 여부만 확인, 실패 시 false |
| `GET /api/stores/{id}/sse` | `playlist-detail.html` `connectSSE()` | `EventSource` (SSE) |
| YouTube Data API v3 | `playlist-detail.html` | 외부 API (백엔드 무관, 아래 참고만) |

---

## 1. 인증 체계

### 1-1. 인증 주체 4종 및 localStorage 키

프론트는 4개의 독립적인 인증 주체를 `localStorage`로 구분합니다. 동시에 존재할 수 있습니다.

| 주체 | accessToken 키 | refreshToken 키 | 부가 키 | 저장 시점 |
|------|---------------|-----------------|---------|-----------|
| 매장 관리자(owner) | `ownerToken` | `ownerRefreshToken` | `ownerStoreId` | 로그인 성공 / refresh 성공 시 (`setOwnerToken`) |
| 플랫폼 관리자(admin) | `adminToken` | (없음) | — | `admin-login.html` 로그인 시 |
| Plan A 구독자(user) | `userToken` | `userRefreshToken` | `userEmail` | 로그인 성공 시 (`setUserToken`) |
| DJ | `djToken` | (없음) | `djName`, `djGenre`, `djIsLive` | 현재 데모용 하드코딩 |

> **주의 — admin vs owner:** 어드민 대시보드(`admin-dashboard.html`)는 `ownerToken`이 아니라 **별도의 `adminToken`**(`localStorage.getItem('adminToken')`)을 사용합니다. 어드민 API(`/api/admin/**`)는 이 토큰을 Bearer로 받습니다. (이전 문서에서 ownerToken으로 표기한 것은 오류입니다.)
> 페이지 진입 시 `adminToken`이 없으면 `admin-login.html`로 리다이렉트합니다.

### 1-2. 토큰 갱신 로직 (owner 전용)

`api.js`의 핵심 패턴입니다.

```
parseJwtExp(token)          // JWT payload의 exp 클레임(ms)만 디코딩 (서명 검증 안 함)
scheduleSessionWarning(t)   // exp - 5분 시점에 자동 silent refresh 타이머 등록
                            //  - refreshAt 이 이미 지났으면 즉시 refreshAccessToken() 호출
                            //  - 강제 로그아웃 타이머는 없음 (refreshToken 유효기간 동안 세션 유지)
refreshAccessToken()        // _refreshPromise 로 동시 호출 1개로 합침(중복 방지)
```

`refreshAccessToken()` 내부:

```
POST /api/owner/refresh
Content-Type: application/json
{ "refreshToken": "<ownerRefreshToken>" }

성공: { "accessToken": "...", "refreshToken": "..." }
 → setOwnerToken(accessToken, refreshToken)  // 두 토큰 갱신 + 새 만료 타이머 등록
실패(res.ok=false 또는 throw): false 반환 → 다음 API 호출의 401 retry에 위임
```

타이머 복원 시점:
- `DOMContentLoaded` 시 `ownerToken`이 있으면 `scheduleSessionWarning` 재등록
- `visibilitychange`로 탭이 다시 visible 되면 타이머 재등록 (모바일/Chrome Memory Saver로 타이머가 동결되는 문제 대응)

### 1-3. 401 재시도 흐름 (시퀀스)

```
apiFetch(GET, /api/owner/..., undefined, ownerToken)
  → 401
  → refreshAccessToken()
       → POST /api/owner/refresh { refreshToken }
       → 성공: 새 ownerToken 저장
  → doFetch( getOwnerToken() )   // 새 토큰으로 1회 재시도
  → 성공 시 정상 응답, 실패 시 그대로 에러
refresh 실패 시 → throw Error('세션이 만료되었습니다.')
```

`playlist-detail.html`은 이 "세션이 만료" 메시지를 잡아 재로그인 배너를 노출합니다(4-3 참조).

> ### 백엔드 확인 요청 (인증)
> 1. `ownerRefreshToken` 유효기간이 **30일** 맞는지 확인 부탁드립니다. 프론트는 강제 로그아웃 타이머 없이 refreshToken 만료까지 세션을 유지합니다. 매장이 하루 종일 재생 후 다음날 새로고침해도 재로그인 없이 재생되어야 합니다.
> 2. **`POST /api/user/refresh` 미구현** — 현재 `refreshAccessToken()`은 owner refresh만 호출합니다. user 토큰 만료 시 자동 갱신이 없어 강제 로그아웃됩니다. (5장 미구현 목록 참조)
> 3. **`adminToken` refresh 미구현** — 어드민 토큰 만료 시 401 → owner refresh를 잘못 시도하므로, 어드민 갱신 정책/엔드포인트 확정 필요.

---

## 2. 인증/계정 API

### 2-1. 매장 관리자 로그인

```
POST /api/owner/login
Content-Type: application/json

{ "loginId": "store01", "password": "••••••" }
```
응답:
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```
후속: `GET /api/owner/stores`로 `storeId` 획득 → `ownerStoreId` 저장 → `playlist.html` 이동.

### 2-2. 매장 관리자 토큰 갱신

```
POST /api/owner/refresh
Content-Type: application/json

{ "refreshToken": "eyJ..." }
```
응답:
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```
> 프론트가 접근하는 필드: `data.accessToken`, `data.refreshToken` (둘 다 필수).

### 2-3. 구독자(Plan A) 로그인

```
POST /api/user/login
Content-Type: application/json

{ "email": "user@example.com", "password": "••••••" }
```
응답:
```json
{ "accessToken": "eyJ...", "refreshToken": "eyJ..." }
```
후속: `playlist.html?tab=dj`로 이동.

### 2-4. 도입 문의 신청

```
POST /api/stores/applications
Content-Type: application/json
```
요청 body (Plan A 라이트 예시):
```json
{
  "applicantName": "홍길동",
  "applicantPhone": "010-0000-0000",
  "inquiryContent": "",
  "planId": 3,
  "usagePeriod": 1,
  "serviceStartDate": "2026-06-10",
  "name": "매장명",
  "industry": "카페",
  "address": "서울시 ...",
  "businessHours": { "월": "09:00~22:00" },
  "photoUrls": [],
  "platform": "스포티파이",
  "playedMusic": "재즈, 인디",
  "customerAgeGroup": "20-30대",
  "playMethods": ["추천"],
  "vibes": ["아늑한"],
  "lighting": 3000,
  "playlistType": "추천",
  "timePreferences": [],
  "mood": "차분한",
  "musicTempo": "MEDIUM",
  "preferenceGenres": ["인디"],
  "rejectGenres": [],
  "rejectedSongNote": ""
}
```
Plan별 필드 차이:

| 필드 | Plan A 라이트 | Plan B 기본 | Plan C 프리미엄 |
|------|--------------|------------|----------------|
| `planId` | `3` | `1` | `2` |
| `serviceStartDate` | 결제일 당일 | 다음 주 화요일 | 다음 주 화요일 |
| `rejectGenres` | 항상 `[]` | 항상 `[]` | 사용자 입력값 |
| `rejectedSongNote` | 항상 `""` | 항상 `""` | 사용자 입력값 |

> **확인 요청:** `planId: 3`(Plan A) 백엔드 등록 여부 확인. 현재 `GET /api/plans` 응답에 Plan A가 없어 프론트가 하드코딩 처리 중.

---

## 3. 어드민 대시보드 API (`adminToken` 인증)

`admin-dashboard.html`이 호출하는 전체 목록입니다. 모든 `/api/admin/**` 호출은 `Authorization: Bearer {adminToken}`.

### 3-1. 매장 목록 조회

```
GET /api/admin/stores?page={n}&size=20
Authorization: Bearer {adminToken}
```
프론트는 응답에서 다음 순서로 목록 배열을 탐색합니다(아무거나 맞으면 사용):
`data.stores → data.storeList → data.content → data.data → data.result → data.list → (배열 자체)`

페이지네이션: `data.totalPages`, `data.totalElements` 사용(없으면 클라이언트 계산).

각 매장 항목에서 접근하는 필드:
```json
{
  "storeId": 12,            // 또는 id
  "name": "매장명",          // 또는 storeName
  "address": "서울 ...",     // 또는 storeAddr
  "applicantName": "홍길동", // 또는 applicant
  "applicantPhone": "010-...",// 또는 contact
  "mainPhotoUrl": "/uploads/...", // 또는 photoUrls[0], storeInfo.mainPhotoUrl, imageUrl
  "currentSong": { "title": "...", "artist": "..." },  // null 가능. 있으면 "재생 중" 표시
  "subscriptions": [
    { "status": "ACTIVE", "planType": "PLAN_LITE", "startDate": "...", "endDate": "..." }
  ]
}
```
- `currentSong` 존재 여부로 "지금 재생 중" 컬럼을 표시합니다.
- 상대경로(`/`로 시작) 사진 URL은 프론트가 `BASE_URL`을 붙입니다.
- `status` 매핑: `ACTIVE`, `EXPIRED`, `PENDING_ACTIVE`, `PENDING_PAYMENT`, `REFUNDED`/`CANCELLED`/`CANCELED`.

### 3-2. 매장 상세 조회

```
GET /api/admin/stores/{storeId}
Authorization: Bearer {adminToken}
```
프론트가 파싱하는 구조 (`mapStoreDetail`):
```json
{
  "applyInfo":   { "applicantName": "...", "applicantPhone": "..." },
  "storeInfo":   {
    "name": "...", "address": "...", "industry": "...",
    "businessHours": [ { "dayOfWeek": 1, "openTime": "09:00:00", "closeTime": "22:00:00", "isClosed": false } ],
    "photoUrls": ["/uploads/..."], "mainPhotoUrl": "/uploads/...",
    "customerAgeGroup": "...", "lighting": 3000
  },
  "musicInfo":   {
    "musicPlatform": "...", "playedMusic": "...",
    "musicTempo": "NORMAL",
    "preferredGenres": ["BALLAD", "INDIE"],   // Enum 배열 → 한글 변환
    "rejectedGenres": ["HIPHOP"],
    "rejectedSongNote": "...",
    "playlistType": "MUSIC_RECOMMENDED",
    "timePreferences": [ { "startTime": "09:00", "endTime": "12:00", "mood": "CALM" } ],
    "musicMood": "CALM"
  },
  "subscriptions": [ { "status": "ACTIVE", "planType": "PLAN_LITE", "startDate": "...", "endDate": "...", "createdAt": "...", "totalAmount": 4400 } ]
}
```

**Enum 역변환 맵 (백엔드 Enum → 프론트 표시):**

| 구분 | Enum → 한글 |
|------|------------|
| 장르 `GENRE_MAP` | `BALLAD`발라드 · `POP`팝 · `ROCK`락 · `JAZZ`재즈 · `CLASSIC`클래식 · `R_AND_B`R&B · `HIP_HOP`/`HIPHOP`힙합 · `DANCE`댄스 · `INDIE`인디 · `FOLK`포크 · `ELECTRONIC`일렉트로닉 · `TROT`트로트 · `CHILDREN`동요 · `OTHER`기타 |
| 템포 `TEMPO_MAP` | `SLOW`느림 · `CALM`잔잔한 · `NORMAL`보통 · `LIVELY`활기찬 · `UPBEAT`경쾌한 |
| 무드(vibe) `VIBE_MAP` | `CALM`차분한 · `MODERN`모던한 · `ELEGANT`우아한 · `DARK`다크한 · `NATURAL`내추럴한 · `OTHER`기타 |
| 재생방식 `PLAY_MAP` | `BLUETOOTH`블루투스 · `WIRED`유선 연결 · `OTHER`기타 |
| 플리유형 `PLAYLIST_MAP` | `MUSIC_RECOMMENDED`추천 음악 · `TIME_BASED`시간대별 무드 · `CONSISTENT_MOOD`일관 무드 |
| 요금제 `PLAN_MAP` | `PLAN_A`→Plan B 기본 · `PLAN_B`→Plan C 프리미엄 · `PLAN_LITE`→Plan A 라이트 · `STANDARD`스탠다드 |

> **요금제 Enum 주의:** 프론트 표시 라벨과 백엔드 Enum 이름이 어긋나 있습니다. 백엔드 `PLAN_A`는 화면상 "Plan B 기본", `PLAN_B`는 "Plan C 프리미엄", `PLAN_LITE`가 "Plan A 라이트"로 매핑됩니다. 이 매핑은 절대 임의로 바꾸지 마세요.

### 3-3. 결제 내역 조회 (어드민)

```
GET /api/admin/payments/stores/{storeId}?page=0&size=20
Authorization: Bearer {adminToken}
```
응답: 배열 자체이거나 `{ "payments": [...] }`. 각 항목에서 접근하는 필드:
```json
{
  "paymentId": 991,
  "paidAt": "2026-06-01T10:00:00",   // 또는 createdAt, paymentDate
  "planType": "PLAN_LITE",            // 또는 subscription.plan, plan
  "totalAmount": 4400,                // 또는 amount
  "status": "PAID",                   // REFUNDED/CANCELLED/CANCELED 시 환불 표시
  "paymentStatus": "DONE",            // PARTIAL_CANCELED/CANCELED 도 환불 판정
  "refundStatus": "NONE",             // COMPLETED 면 환불 판정
  "refunds": [ { "cancelAmount": 4400, "refundedAt": "..." } ]  // 배열 마지막 항목 사용
}
```
환불 판정은 위 어느 조건이라도 만족하면 "환불됨"으로 처리합니다.

### 3-4. 환불 처리

```
POST /api/admin/payments/{paymentId}/refund
Authorization: Bearer {adminToken}
Content-Type: application/json

{ "cancelAmount": 4400, "cancelReason": "고객 요청" }
```
- `cancelReason`은 현재 항상 `"고객 요청"` 고정.
- 성공 시 프론트는 해당 paymentId/storeId를 `sessionStorage`에 환불 완료로 기록(탭 닫으면 초기화).

### 3-5. 시간대별 무드 설정

```
PATCH /api/admin/stores/{storeId}/time-preferences
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "timePreferences": [
    { "startTime": "09:00", "endTime": "12:00", "mood": "차분한" },
    { "startTime": "12:00", "endTime": "18:00", "mood": "활기찬" },
    { "startTime": "18:00", "endTime": "22:00", "mood": "로맨틱한" }
  ]
}
```

> **중요 — mood 값은 한글 라벨입니다 (이전 문서의 영어 값은 오류).**
> 프론트는 select에서 고른 한글 라벨을 그대로 전송합니다. 허용 값 목록(`MOODS`):
> `선택 안 함`, `차분한`, `모던한`, `우아한`, `다크한`, `내추럴한`, `활기찬`, `신나는`, `로맨틱한`, `재즈/소울`, `클래식`, `어쿠스틱`

조회 시(`GET /api/admin/stores/{id}` 응답의 `timePreferences[].mood`)는 백엔드 Enum이 올 수 있고, 프론트가 `MOOD_TO_SLOT`으로 역매핑합니다:

| Enum | 한글 슬롯 |
|------|----------|
| `CALM` | 차분한 |
| `MODERN` | 모던한 |
| `ELEGANT` | 우아한 |
| `DARK` | 다크한 |
| `NATURAL` | 내추럴한 |
| `LIVELY` / `ENERGETIC` | 활기찬 |
| `EXCITING` | 신나는 |
| `ROMANTIC` | 로맨틱한 |
| `JAZZ_SOUL` / `JAZZSOUL` / `JAZZ` | 재즈/소울 |
| `CLASSIC` / `CLASSICAL` | 클래식 |
| `ACOUSTIC` | 어쿠스틱 |
| `OTHER` | 선택 안 함 |

> **확인 요청:** 저장(PATCH)은 한글로 보내는데 조회(GET)는 Enum으로 내려오는 비대칭 구조입니다. 백엔드가 한글 라벨을 받아 Enum으로 저장하는지, 아니면 한글을 그대로 저장하는지 확정 필요. 가능하면 양방향 모두 동일 표현(한글 또는 Enum)으로 통일 요청드립니다.

### 3-6. 추천곡 풀 조회 (어드민)

```
GET /api/admin/stores/{storeId}/songs/recommendations
Authorization: Bearer {adminToken}
```
응답: 배열 자체이거나 `{ "recommendations": [...] }` 또는 `{ "songs": [...] }`. 각 항목에서 접근하는 필드:
```json
{
  "title": "곡명",          // 또는 songTitle
  "artist": "아티스트",      // 또는 artistName
  "genre": "발라드",         // 그대로 표시 (차단 장르와 매칭)
  "refereeName": "신청자",   // 또는 who
  "createdAt": "2026.06.10"  // 또는 recommendedAt, time. "오늘 추천" 판정에 prefix 비교 사용
}
```
> `createdAt`/`time`은 프론트가 `YYYY.MM.DD`로 시작하는지로 "오늘 추천" 그룹을 나눕니다. 날짜 포맷에 점(`.`) 구분 또는 ISO여도 되지만, 오늘 판정이 정확하려면 날짜 부분이 식별 가능해야 합니다.

### 3-7. 차단 장르 설정

```
PATCH /api/admin/stores/{storeId}/genres
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "genres": [
    { "genre": "BALLAD",   "preferenceType": "LIKE" },
    { "genre": "HIPHOP",   "preferenceType": "DISLIKE" },
    { "genre": "INDIE",    "preferenceType": "LIKE" },
    { "genre": "ROCK",     "preferenceType": "LIKE" },
    { "genre": "DANCE",    "preferenceType": "LIKE" },
    { "genre": "CLASSIC",  "preferenceType": "LIKE" },
    { "genre": "CHILDREN", "preferenceType": "DISLIKE" }
  ]
}
```
**장르 Enum 매핑 (이 7종 고정, `GENRE_ENUM`):**

| 화면 표시 | API 전송값 |
|----------|-----------|
| 발라드 | `BALLAD` |
| 힙합 | `HIPHOP` |
| 인디 | `INDIE` |
| 락 | `ROCK` |
| 댄스 | `DANCE` |
| 클래식 | `CLASSIC` |
| 동요 | `CHILDREN` |

`preferenceType`: `"LIKE"`(선호/허용) · `"DISLIKE"`(차단).

> **전체 교체 방식:** 프론트는 항상 위 **7개 장르 전체를 한 번에** 전송합니다(부분 업데이트 없음). 차단 안 한 장르도 `LIKE`로 포함됩니다. 백엔드는 해당 매장의 기존 장르 설정을 **전체 교체** 처리해 주세요.

### 3-8. 예약 플레이리스트 일괄 등록

두 화면(파일 업로드 / 무드 랜덤 생성)에서 동일 엔드포인트를 호출합니다.

```
POST /api/admin/scheduled-playlists
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "schedulePlaylists": [
    {
      "storeName": "매장A",
      "scheduledAt": "2026-06-10T09:00:00.000Z",
      "songs": [
        { "title": "곡명", "artist": "아티스트", "vid": "dQw4w9WgXcQ", "playTime": 240 }
      ]
    },
    {
      "storeName": "매장A",
      "scheduledAt": "2026-06-10T12:00:00.000Z",
      "songs": [
        { "title": "...", "artist": "...", "vid": "...", "playTime": 200 }
      ]
    }
  ]
}
```
필드 설명:

| 필드 | 타입 | 설명 |
|------|------|------|
| `storeName` | string | 매장 식별. (storeId가 아니라 **매장명**으로 전송) |
| `scheduledAt` | ISO 8601 | `new Date(...).toISOString()` 결과 — **UTC, `.000Z` 포함**. 해당 시각에 적용될 플리 |
| `songs[].title` / `artist` | string | 곡명/아티스트 |
| `songs[].vid` | string | YouTube 동영상 ID **11자리** (전체 URL 아님). 무드 생성 시 누락분은 임시 ID 자동 생성될 수 있음 |
| `songs[].playTime` | number | **초 단위** 재생 시간 (예: 240 = 4분). `mm:ss`/`hh:mm:ss`/숫자 문자열을 초로 변환해 전송 |

> **mood/hour 필드 제거:** 무드 랜덤 생성 화면은 내부적으로 각 항목에 `mood`, `hour`를 들고 있다가, **전송 직전에 두 필드를 제거**하고 보냅니다. 즉 백엔드로는 위 4개 필드(`storeName`, `scheduledAt`, `songs`)만 갑니다. `vid`와 `playTime`은 반드시 포함됩니다.

### 3-9. (어드민) 매장별 현재 플레이리스트 조회

어드민 화면에서 "현재 플리 비교"용으로 public 플레이리스트 엔드포인트를 `adminToken`과 함께 호출합니다.

```
GET /api/stores/{storeId}/playlists
Authorization: Bearer {adminToken}
```
프론트 접근: `data.playlist.songs` (없으면 빈 배열).

---

## 4. 플레이리스트 재생 흐름 (`playlist-detail.html`)

### 4-1. 매장 요약 정보

```
GET /api/stores/{storeId}/summary
```
(비인증 public) 접근 필드: `name`/`storeInfo.name`, `industry`, `address`, `mainPhotoUrl`/`photoUrls[0]`, `businessHours[]`(`dayOfWeek`, `openTime`, `closeTime`, `isClosed`), `planType`/`subscription.planType`.
- `planType === 'PLAN_B'`(=화면상 Plan C 프리미엄)일 때만 "노래 신청" 카드 노출.
- 실패 시 fallback: ① `localStorage`의 `storeCache_{storeId}` ② `GET /api/stores?page=0&size=100`에서 `storeId` 매칭.

### 4-2. 플레이리스트 조회 — owner vs public 분기

핵심 분기 로직입니다.

```
ownerToken 있음?
 ├─ 예 → GET /api/owner/stores/{storeId}/playlists  (Authorization: Bearer ownerToken)
 │        성공 → isMyStore = true
 │               └ 단, 응답에 songs가 비어있으면 public 으로 fallback (아래)
 │        실패 → isMyStore = false
 │               └ 에러 메시지에 '세션이 만료' 포함 시 sessionExpired 플래그 → 재로그인 배너
 │               └ GET /api/stores/{storeId}/playlists  (비인증)
 └─ 아니오 → GET /api/stores/{storeId}/playlists       (비인증)
```

- **owner 엔드포인트:** `GET /api/owner/stores/{storeId}/playlists` — 내 매장이면 전체 재생 권한. `isMyStore`는 storeId 비교가 아니라 **owner 호출 성공 여부**로 결정.
- **public 엔드포인트:** `GET /api/stores/{storeId}/playlists` — 비로그인/타매장. 미리듣기/대기 안내만.

두 엔드포인트 공통 응답 구조 (프론트는 `playlist.playlist || playlist`로 언랩):
```json
{
  "playlist": {
    "songs": [
      {
        "title": "...",            // 또는 songTitle
        "artist": "...",           // 또는 artistName
        "playTime": 210,           // 또는 durationSeconds (초)
        "refereeName": "신청자",    // null 가능
        "playlistSongId": 5001,
        "videoId": "dQw4w9WgXcQ",  // 또는 vid, youtubeId, youtubeVideoId
        "playOrder": 3
      }
    ]
  },
  "currentSong": {
    "playlistSongId": 5001,
    "elapsedSeconds": 87,          // 현재 곡 경과 초
    "vid": "dQw4w9WgXcQ"           // 또는 videoId
  }
}
```

### 4-3. `currentSong` / `elapsedSeconds` / `shouldPlay` 의미

백엔드가 반드시 이해해야 하는 재생 판단 로직입니다.

| 개념 | 의미 |
|------|------|
| `currentSong` | **서버가 판단한 "지금 재생되어야 할 곡"**. 이 객체가 있고 `playlistSongId`가 곡 목록에서 매칭되면 `shouldPlay = true`가 되어 실제 재생이 시작됨 |
| `currentSong` 없음 | `shouldPlay = false` → "현재 재생 중인 음악이 없어요(영업시간 외)" 안내만 표시, 재생 안 함 |
| `elapsedSeconds` | 현재 곡의 경과 시간(초). 프론트는 `songStartedAt = Date.now() - elapsedSeconds*1000`으로 **재생 위치를 서버 기준에 동기화** (페이지 진입 시점에 곡 중간부터 이어 재생) |
| `playlistSongId` | currentSong ↔ songs[] 매칭 키. 매칭 실패 시 재생 시작 안 함 |
| `videoId`/`vid` | YouTube IFrame Player 재생용. songs에 없으면 currentSong의 vid로 보완 |

즉 백엔드는 영업시간/스케줄에 따라 **현재 재생할 곡과 경과 초를 `currentSong`으로 내려주면**, 프론트가 그 위치부터 재생합니다. 빈 플리 → "제작 중", currentSong 없음 → "대기 중".

### 4-4. SSE 실시간 추천곡 푸시

```
GET /api/stores/{storeId}/sse          (EventSource, 비인증)
event: SONG_RECOMMENDED
```
이벤트 `data`(JSON) 구조 — 프론트 접근 필드:
```json
{
  "title": "곡명",
  "artist": "아티스트",
  "playTime": 240,          // 초
  "refereeName": "신청자",
  "playlistSongId": 5012,
  "playOrder": 7,
  "vid": "dQw4w9WgXcQ"
}
```
동작: 수신 시 `playOrder` 기준 정렬 위치에 곡을 삽입하고, 내 매장(`isMyStore`)이면 현재 재생 위치를 유지한 채 YouTube 재생목록을 갱신합니다. SSE는 `shouldPlay`(재생 중)일 때만 연결합니다.

### 4-5. 노래 신청 (Plan C 매장)

신청 생성:
```
POST /api/stores/{storeId}/songs/recommendations
Content-Type: application/json

{
  "title": "곡명",
  "artist": "아티스트",
  "vid": "dQw4w9WgXcQ",   // YouTube 검색으로 획득한 11자리 ID
  "playTime": 210,         // 초 (영상 길이에서 변환, 기본 210)
  "refereeName": "신청자 이름"
}
```
응답 (프론트 접근 필드 — 결제 위젯에 사용):
```json
{
  "orderId": "ORD_...",
  "amount": 990,
  "orderName": "노래 신청 - 곡명",
  "songRecommendationId": 7001
}
```

결제 승인 (Toss 리다이렉트 `?recConfirm` 처리):
```
POST /api/payments/confirm
Content-Type: application/json

{ "paymentType": "SONG_RECOMMENDATION", "paymentKey": "...", "orderId": "...", "amount": 990 }
```
결제 실패 (`?recFail` 처리):
```
POST /api/payments/fail
Content-Type: application/json

{ "orderId": "..." }
```
승인 성공 후 프론트는 플리를 즉시 재조회합니다(내 매장이면 `/api/owner/stores/{id}/playlists`, 아니면 `/api/stores/{id}/playlists`).

### 4-6. (참고) YouTube Data API — 백엔드 무관

프론트가 곡 미리보기/길이 추출용으로 `https://www.googleapis.com/youtube/v3/search`, `.../videos`를 직접 호출합니다. 백엔드 구현과 무관하며, 여기서 얻은 `videoId`/길이를 4-5의 `vid`/`playTime`으로 사용합니다.

---

## 5. 매장 관리자 마이페이지 / 매장 목록 (`playlist.html`)

| 호출 | 인증 | 용도 / 접근 필드 |
|------|------|-----------------|
| `GET /api/stores?page=0&size=20` | 없음 | 브랜드 매장 그리드. `data.stores` 또는 배열. 각 `storeId`, `name`, `address`, `mainPhotoUrl`, `currentSong` |
| `GET /api/stores/{storeId}/playlists` | 없음 | `checkPlaying()` — `data.currentSong` 또는 `data.playlist.currentSong` 존재로 재생중 판정 |
| `GET /api/owner/stores` | ownerToken | 내 매장 목록. `data.stores` 또는 배열. `storeId`/`id` |
| `GET /api/stores?page=0&size=100` | 없음 | 내 매장 상세(사진 등) 보강. owner 목록의 storeId로 필터 |
| `GET /api/owner/payments/stores/{storeId}?page=0&size=20` | ownerToken | 환불 여부 확인. 배열 또는 `{payments:[]}`, 각 `refunds[].refundedAt` 등 |
| `GET /api/owner/stores/{storeId}/subscriptions` | ownerToken | 구독 상태. `{subscriptions:[]}` 또는 배열, 각 `status`(REFUNDED/CANCELLED/CANCELED 면 환불) |

> 마이페이지 매장 섹션은 위 환불 판정 결과 환불 상태이면 섹션 자체를 미노출합니다.

---

## 6. 미구현 / 더미 처리 API (우선순위별)

| 우선순위 | 엔드포인트 | 현재 프론트 처리 | 메모 |
|---------|-----------|-----------------|------|
| **긴급** | `ownerRefreshToken` 30일 유효 확인 | refresh 자동 호출 | 미충족 시 다음날 재생 끊김 |
| **높음** | `planId: 3` 등록 확인 | 도입 문의가 `planId=3` 전송 | 미등록 시 신청 실패 |
| **높음** | `POST /api/user/refresh` | **미구현** — user 토큰 갱신 없음 | body `{refreshToken}`, resp `{accessToken, refreshToken}` 예상 |
| **중간** | `GET /api/user/subscription` | 오늘~+1개월 하드코딩 표시 | resp 기대: `{planName, monthlyRate, startDate, endDate}` |
| **중간** | `GET /api/user/payments` | "결제 내역 준비 중" 문구 | — |
| **중간** | `POST /api/stores/images` (multipart) | 미연결, `photoUrls: []`로 전송 | resp 기대: `{urls: [...]}` |
| **낮음** | `GET /api/dj/playlists` | `DJ_PLAYLISTS_SAMPLE` 하드코딩 | 아래 구조 |
| **낮음** | `GET /api/dj/playlists/{id}` | `dj-playlist-detail.html` 하드코딩 | 아래 구조 |
| **낮음** | `GET /api/dj/playlists/{id}/stream` (또는 `/tracks/{trackId}/stream`) | 진행바 시뮬레이션만 | 실제 오디오 없음 |
| **낮음** | `GET/POST/DELETE /api/dj/tracks`, `POST /api/dj/live/start`·`stop` | 전체 더미, 라이브 ON/OFF는 `localStorage('djIsLive')`만 | 서버 동기화 없음 |

DJ 목록 기대 구조 (`GET /api/dj/playlists`):
```json
[ { "id": 1, "name": "선선한 오후 카페", "djName": "DJ Parkwan", "emoji": "☕", "isLive": true, "listeners": 47, "tracks": 14 } ]
```
DJ 상세 기대 구조 (`GET /api/dj/playlists/{id}`):
```json
{ "id": 1, "name": "...", "djName": "...", "emoji": "☕", "isLive": true, "listeners": 47, "currentIdx": 3, "tracks": [ { "secs": 186 } ] }
```
> DJ 상세 재생 권한: `userToken`·`djToken`·`ownerToken` 중 하나라도 있으면 전체 재생 허용.

---

## 7. 전체 엔드포인트 빠른 색인

| Method | Path | 인증 | 비고 |
|--------|------|------|------|
| POST | `/api/owner/login` | — | 매장 관리자 로그인 |
| POST | `/api/owner/refresh` | refreshToken(body) | owner 토큰 갱신 (fetch 직접) |
| GET | `/api/owner/stores` | ownerToken | 내 매장 목록 |
| GET | `/api/owner/stores/{id}/playlists` | ownerToken | 내 매장 플리(전체 재생) |
| GET | `/api/owner/stores/{id}/subscriptions` | ownerToken | 구독 상태 |
| GET | `/api/owner/payments/stores/{id}` | ownerToken | 결제/환불 내역 |
| POST | `/api/user/login` | — | 구독자 로그인 |
| POST | `/api/stores/applications` | — | 도입 문의 |
| GET | `/api/stores?page&size` | — | 매장 목록 |
| GET | `/api/stores/{id}/summary` | — | 매장 요약 |
| GET | `/api/stores/{id}/playlists` | — / token | public 플리 |
| GET | `/api/stores/{id}/sse` | — | SSE(`SONG_RECOMMENDED`) |
| POST | `/api/stores/{id}/songs/recommendations` | — | 노래 신청 생성 |
| POST | `/api/payments/confirm` | — | 결제 승인 |
| POST | `/api/payments/fail` | — | 결제 실패 |
| GET | `/api/admin/stores?page&size` | adminToken | 매장 목록 |
| GET | `/api/admin/stores/{id}` | adminToken | 매장 상세 |
| GET | `/api/admin/stores/{id}/songs/recommendations` | adminToken | 추천곡 풀 |
| PATCH | `/api/admin/stores/{id}/time-preferences` | adminToken | 시간대별 무드(한글) |
| PATCH | `/api/admin/stores/{id}/genres` | adminToken | 차단 장르(7종 전체 교체) |
| GET | `/api/admin/payments/stores/{id}` | adminToken | 결제 내역 |
| POST | `/api/admin/payments/{id}/refund` | adminToken | 환불 |
| POST | `/api/admin/scheduled-playlists` | adminToken | 예약 플리 일괄 등록 |

---

## 8. 변경 이력 요약

| 날짜 | 항목 | 내용 |
|------|------|------|
| 2026-06-03 | 차단 장르 | 요청 body 한글→영어 Enum 변환 (7종 전체 교체 방식) |
| 2026-06-03 | 시간대별 무드/차단 장르 | 엔드포인트 경로 수정 |
| 2026-06-04 | 토큰 자동 갱신 | `scheduleSessionWarning` — 이미 갱신 시점 지난 토큰도 즉시 refresh |
| 2026-06-04 | 탭 동결 대응 | `visibilitychange`로 타이머 재등록 |
| 2026-06-05 | 재생 동기화 | `currentSong.elapsedSeconds` 기반 wall-clock 재생 위치 동기화 |
| 2026-06-05 | 예약 플리 | 무드 랜덤 생성 시 `mood`/`hour` 필드 제거 후 전송, `scheduledAt` UTC ISO |
| 2026-06-10 | 본 문서 | 어드민 인증 토큰을 `adminToken`으로 정정, time-preferences mood를 한글 라벨로 정정, SSE·currentSong·노래 신청·결제 흐름 추가 |

---

### 이전 문서 대비 주요 정정 사항 (백엔드 필독)
1. **어드민 API 인증 토큰은 `adminToken`** 입니다 (이전 문서의 ownerToken 표기는 오류).
2. **`time-preferences`의 `mood`는 한글 라벨**(`차분한` 등)로 전송됩니다 (이전 문서의 `Happy`/`Calm` 등 영어 값은 오류). 단, 조회 응답은 Enum으로 내려오는 비대칭 구조 → 통일 검토 요청.
3. **요금제 Enum 매핑 비직관성**: 백엔드 `PLAN_A`=화면 "Plan B 기본", `PLAN_B`="Plan C 프리미엄", `PLAN_LITE`="Plan A 라이트".
4. 예약 플리는 **storeId가 아닌 storeName**으로 전송, `scheduledAt`은 **UTC `.000Z` ISO**.
