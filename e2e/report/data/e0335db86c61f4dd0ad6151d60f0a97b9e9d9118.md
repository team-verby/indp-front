# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: plan-a.spec.js >> Plan A 섹션 >> apply.html → payment.html 이동 흐름 UI
- Location: e2e/plan-a.spec.js:114:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /payment\.html.*plan=A/
Received string:  "https://dev.indpmusic.co.kr/apply.html?plan=A"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    24 × unexpected value "https://dev.indpmusic.co.kr/apply.html?plan=A"

```

```yaml
- navigation:
  - link "인디피 뮤직":
    - /url: index.html
    - img "인디피 뮤직"
  - list:
    - listitem:
      - link "인디피 뮤직":
        - /url: index.html
    - listitem:
      - link "플레이리스트":
        - /url: playlist.html
    - listitem:
      - link "음악 힙지수 테스트":
        - /url: mood-test.html
  - link "로그인":
    - /url: login.html
  - link "도입 문의":
    - /url: plan.html
- heading "계정 생성" [level=1]
- paragraph: 서비스 이용을 위한 계정 정보를 입력해 주세요
- text: ✓ 요금제 선택 2 정보 입력 3 결제 진행 4 신청 완료
- heading "계정 생성" [level=2]
- text: 성함 *
- textbox "성함 *":
  - /placeholder: 성함을 입력해 주세요
  - text: UI테스트
- text: 아이디 *
- textbox "아이디 *":
  - /placeholder: 영문·숫자 조합 4자 이상
- button "중복 확인"
- paragraph: 영문·숫자·언더바(_) 조합 4자 이상으로 입력해 주세요.
- text: 이메일 *
- textbox "이메일 *":
  - /placeholder: 공지 및 정산 수신에 사용됩니다
  - text: ui.flow.1781496316857@indptest.com
- text: 비밀번호 *
- textbox "비밀번호 *":
  - /placeholder: 8자 이상 입력해 주세요
  - text: testbot123!
- text: 비밀번호 확인 *
- textbox "비밀번호 확인 *":
  - /placeholder: 비밀번호를 한 번 더 입력해 주세요
  - text: testbot123!
- paragraph: 필수 항목을 모두 입력해 주세요.
- link "이전":
  - /url: plan.html
- button "다음"
- contentinfo:
  - paragraph: "대표이사: 박완"
  - paragraph: "사업자 등록번호: 666-20-01980"
  - paragraph: "통신판매업 번호: 2026-서울서대문-0358"
  - paragraph: 주소 03628 서울특별시 서대문구 통일로 484 서대문구창업지원센터 321호 버비컴퍼니
  - paragraph: "고객 문의: verbykorea@gmail.com"
  - link "서비스 이용약관":
    - /url: terms.html
  - text: "|"
  - link "개인정보 처리방침":
    - /url: privacy.html
  - text: INDP MUSIC
- text: Copyright 2026. VERBY Co. all rights reserved.
```

# Test source

```ts
  28  |     await page.fill('#lite-pw', TEST_PASSWORD);
  29  |     await page.fill('#lite-pw2', TEST_PASSWORD);
  30  |   });
  31  | 
  32  |   test('POST /api/user/applications — 월간 구독 신청 성공', async ({ request }) => {
  33  |     const res = await request.post(`${BASE_API}/api/user/applications`, {
  34  |       data: {
  35  |         name: '테스트유저',
  36  |         email: TEST_EMAIL,
  37  |         password: TEST_PASSWORD,
  38  |         usagePeriod: 1,
  39  |       },
  40  |     });
  41  |     expect(res.status()).toBe(201);
  42  |     const body = await res.json();
  43  |     expect(body).toHaveProperty('orderId');
  44  |     expect(body).toHaveProperty('amount', 4400);
  45  |     expect(body).toHaveProperty('orderName');
  46  |     expect(body.orderName).toContain('월간');
  47  |   });
  48  | 
  49  |   test('POST /api/user/applications — 연간 구독 신청 성공', async ({ request }) => {
  50  |     const email = `plan.a.annual.${Date.now()}@indptest.com`;
  51  |     const res = await request.post(`${BASE_API}/api/user/applications`, {
  52  |       data: { name: '연간유저', email, password: TEST_PASSWORD, usagePeriod: 12 },
  53  |     });
  54  |     expect(res.status()).toBe(201);
  55  |     const body = await res.json();
  56  |     expect(body.amount).toBe(52800);
  57  |     expect(body.orderName).toContain('연간');
  58  |   });
  59  | 
  60  |   test('POST /api/user/applications — 이메일 중복 409', async ({ request }) => {
  61  |     // 이미 위에서 TEST_EMAIL로 가입됨
  62  |     const res = await request.post(`${BASE_API}/api/user/applications`, {
  63  |       data: { name: '중복', email: TEST_EMAIL, password: TEST_PASSWORD, usagePeriod: 1 },
  64  |     });
  65  |     expect(res.status()).toBe(409);
  66  |   });
  67  | 
  68  |   test('POST /api/user/applications — 잘못된 usagePeriod 400', async ({ request }) => {
  69  |     const res = await request.post(`${BASE_API}/api/user/applications`, {
  70  |       data: { name: '오류', email: `bad.period.${Date.now()}@test.com`, password: TEST_PASSWORD, usagePeriod: 3 },
  71  |     });
  72  |     expect(res.status()).toBe(400);
  73  |   });
  74  | 
  75  |   test('Plan A 사용자 로그인 → userToken 발급', async ({ request }) => {
  76  |     const res = await request.post(`${BASE_API}/api/auth/login`, {
  77  |       data: { loginId: TEST_EMAIL, password: TEST_PASSWORD },
  78  |     });
  79  |     expect(res.status()).toBe(200);
  80  |     const body = await res.json();
  81  |     expect(body.planType).toBe('PLAN_A');
  82  |     expect(body).toHaveProperty('accessToken');
  83  |     expect(body).toHaveProperty('refreshToken');
  84  |     expect(body.storeId).toBeNull();
  85  |   });
  86  | 
  87  |   test('GET /api/user/subscription — 결제 전 구독 없음 404', async ({ request }) => {
  88  |     const loginRes = await request.post(`${BASE_API}/api/auth/login`, {
  89  |       data: { loginId: TEST_EMAIL, password: TEST_PASSWORD },
  90  |     });
  91  |     const { accessToken } = await loginRes.json();
  92  | 
  93  |     const res = await request.get(`${BASE_API}/api/user/subscription`, {
  94  |       headers: { Authorization: `Bearer ${accessToken}` },
  95  |     });
  96  |     // 결제 미완료 → 구독 PENDING_PAYMENT 상태 → 활성 구독 없음
  97  |     expect(res.status()).toBe(404);
  98  |   });
  99  | 
  100 |   test('GET /api/user/payments — 결제 전 빈 배열', async ({ request }) => {
  101 |     const loginRes = await request.post(`${BASE_API}/api/auth/login`, {
  102 |       data: { loginId: TEST_EMAIL, password: TEST_PASSWORD },
  103 |     });
  104 |     const { accessToken } = await loginRes.json();
  105 | 
  106 |     const res = await request.get(`${BASE_API}/api/user/payments`, {
  107 |       headers: { Authorization: `Bearer ${accessToken}` },
  108 |     });
  109 |     expect(res.status()).toBe(200);
  110 |     const body = await res.json();
  111 |     expect(body.payments).toEqual([]);
  112 |   });
  113 | 
  114 |   test('apply.html → payment.html 이동 흐름 UI', async ({ page }) => {
  115 |     const email = `ui.flow.${Date.now()}@indptest.com`;
  116 | 
  117 |     await page.goto('/apply.html?plan=A');
  118 |     await page.waitForLoadState('networkidle');
  119 |     await expect(page.locator('#lite-name')).toBeVisible();
  120 | 
  121 |     await page.fill('#lite-name', 'UI테스트');
  122 |     await page.fill('#lite-email', email);
  123 |     await page.fill('#lite-pw', TEST_PASSWORD);
  124 |     await page.fill('#lite-pw2', TEST_PASSWORD);
  125 | 
  126 |     // 다음 버튼 클릭 → payment.html?plan=A 이동
  127 |     await page.click('button:has-text("다음")');
> 128 |     await expect(page).toHaveURL(/payment\.html.*plan=A/, { timeout: 10_000 });
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  129 | 
  130 |     // payment.html 에서 Plan A 결제 주기 선택 UI 확인
  131 |     await page.waitForLoadState('networkidle');
  132 |     await expect(page.locator('#durationOptions')).toBeVisible({ timeout: 5_000 });
  133 |   });
  134 | 
  135 |   test('payment.html Plan A — 결제하기 클릭 시 /api/user/applications 호출', async ({ page }) => {
  136 |     const email = `pay.ui.${Date.now()}@indptest.com`;
  137 | 
  138 |     // apply.html에서 정보 설정
  139 |     await page.goto('/apply.html?plan=A');
  140 |     await page.waitForLoadState('networkidle');
  141 |     await page.fill('#lite-name', '결제테스트');
  142 |     await page.fill('#lite-email', email);
  143 |     await page.fill('#lite-pw', TEST_PASSWORD);
  144 |     await page.fill('#lite-pw2', TEST_PASSWORD);
  145 |     await page.click('button:has-text("다음")');
  146 |     await page.waitForURL(/payment\.html/, { timeout: 10_000 });
  147 |     await page.waitForLoadState('networkidle');
  148 | 
  149 |     // 월간 선택 (첫 번째 옵션)
  150 |     await page.locator('.duration-option').first().click();
  151 | 
  152 |     // 이용약관 동의 체크박스 클릭
  153 |     const checkbox = page.locator('input[type="checkbox"]').first();
  154 |     if (await checkbox.isVisible()) await checkbox.click();
  155 | 
  156 |     // 결제하기 → /api/user/applications API 호출 감시
  157 |     const [apiRes] = await Promise.all([
  158 |       page.waitForResponse(
  159 |         res => res.url().includes('/api/user/applications') && res.request().method() === 'POST',
  160 |         { timeout: 10_000 }
  161 |       ),
  162 |       page.locator('button:has-text("결제하기")').click(),
  163 |     ]);
  164 | 
  165 |     expect(apiRes.status()).toBe(201);
  166 |     const body = await apiRes.json();
  167 |     expect(body).toHaveProperty('orderId');
  168 |     expect(body.amount).toBe(4400);
  169 |   });
  170 | 
  171 | });
  172 | 
```