# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: plan-a.spec.js >> Plan A 섹션 >> payment.html Plan A — 결제하기 클릭 시 /api/user/applications 호출
- Location: e2e/plan-a.spec.js:135:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "인디피 뮤직" [ref=e4] [cursor=pointer]:
        - /url: index.html
        - img "인디피 뮤직" [ref=e5]
      - list [ref=e6]:
        - listitem [ref=e7]:
          - link "인디피 뮤직" [ref=e8] [cursor=pointer]:
            - /url: index.html
        - listitem [ref=e9]:
          - link "플레이리스트" [ref=e10] [cursor=pointer]:
            - /url: playlist.html
        - listitem [ref=e11]:
          - link "음악 힙지수 테스트" [ref=e12] [cursor=pointer]:
            - /url: mood-test.html
      - generic [ref=e13]:
        - link "로그인" [ref=e14] [cursor=pointer]:
          - /url: login.html
        - link "도입 문의" [ref=e15] [cursor=pointer]:
          - /url: plan.html
  - generic [ref=e16]:
    - heading "계정 생성" [level=1] [ref=e17]
    - paragraph [ref=e18]: 서비스 이용을 위한 계정 정보를 입력해 주세요
    - generic [ref=e19]:
      - generic [ref=e21]:
        - generic [ref=e22]: ✓
        - generic [ref=e23]: 요금제 선택
      - generic [ref=e26]:
        - generic [ref=e27]: "2"
        - generic [ref=e28]: 정보 입력
      - generic [ref=e31]:
        - generic [ref=e32]: "3"
        - generic [ref=e33]: 결제 진행
      - generic [ref=e36]:
        - generic [ref=e37]: "4"
        - generic [ref=e38]: 신청 완료
    - generic [ref=e39]:
      - heading "계정 생성" [level=2] [ref=e40]
      - generic [ref=e41]:
        - generic [ref=e42]: 성함 *
        - textbox "성함 *" [ref=e43]:
          - /placeholder: 성함을 입력해 주세요
          - text: 결제테스트
      - generic [ref=e44]:
        - generic [ref=e45]: 아이디 *
        - generic [ref=e46]:
          - textbox "아이디 *" [ref=e47]:
            - /placeholder: 영문·숫자 조합 4자 이상
          - button "중복 확인" [ref=e48] [cursor=pointer]
        - paragraph [ref=e49]: 영문·숫자·언더바(_) 조합 4자 이상으로 입력해 주세요.
      - generic [ref=e50]:
        - generic [ref=e51]: 이메일 *
        - textbox "이메일 *" [ref=e52]:
          - /placeholder: 공지 및 정산 수신에 사용됩니다
          - text: pay.ui.1781496340636@indptest.com
      - generic [ref=e53]:
        - generic [ref=e54]: 비밀번호 *
        - textbox "비밀번호 *" [ref=e55]:
          - /placeholder: 8자 이상 입력해 주세요
          - text: testbot123!
      - generic [ref=e56]:
        - generic [ref=e57]: 비밀번호 확인 *
        - textbox "비밀번호 확인 *" [ref=e58]:
          - /placeholder: 비밀번호를 한 번 더 입력해 주세요
          - text: testbot123!
    - paragraph [ref=e59]: 필수 항목을 모두 입력해 주세요.
    - generic [ref=e60]:
      - link "이전" [ref=e61] [cursor=pointer]:
        - /url: plan.html
      - button "다음" [active] [ref=e62] [cursor=pointer]
  - contentinfo [ref=e63]:
    - generic [ref=e65]:
      - paragraph [ref=e66]: "대표이사: 박완"
      - paragraph [ref=e67]: "사업자 등록번호: 666-20-01980"
      - paragraph [ref=e68]: "통신판매업 번호: 2026-서울서대문-0358"
      - paragraph [ref=e69]: 주소 03628 서울특별시 서대문구 통일로 484 서대문구창업지원센터 321호 버비컴퍼니
      - paragraph [ref=e70]: "고객 문의: verbykorea@gmail.com"
      - generic [ref=e71]:
        - link "서비스 이용약관" [ref=e72] [cursor=pointer]:
          - /url: terms.html
        - generic [ref=e73]: "|"
        - link "개인정보 처리방침" [ref=e74] [cursor=pointer]:
          - /url: privacy.html
    - generic [ref=e75]: INDP MUSIC
  - generic [ref=e76]: Copyright 2026. VERBY Co. all rights reserved.
```

# Test source

```ts
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
  128 |     await expect(page).toHaveURL(/payment\.html.*plan=A/, { timeout: 10_000 });
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
> 146 |     await page.waitForURL(/payment\.html/, { timeout: 10_000 });
      |                ^ TimeoutError: page.waitForURL: Timeout 10000ms exceeded.
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