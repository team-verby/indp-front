/**
 * 섹션 5: Plan A (개인 구독) UI + API 점검
 * - apply.html 폼 입력 → payment.html 이동
 * - POST /api/user/applications API 검증
 * - GET /api/user/subscription / /payments 검증
 */
import { test, expect } from '@playwright/test';

const BASE_API = 'https://dev-api.indpmusic.co.kr';
const TS = Date.now();
const TEST_LOGIN_ID = `plantest${TS % 1000000}`;
const TEST_EMAIL = `plan.a.test.${TS}@indptest.com`;
const TEST_PASSWORD = 'testbot123!';

test.describe('Plan A 섹션', () => {

  test('apply.html — Plan A 폼 진입 및 필드 노출 확인', async ({ page }) => {
    await page.goto('/apply.html?plan=A');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#lite-name')).toBeVisible({ timeout: 5_000 });
    await expect(page.locator('#lite-id')).toBeVisible();
    await expect(page.locator('#lite-email')).toBeVisible();
    await expect(page.locator('#lite-pw')).toBeVisible();
    await expect(page.locator('#lite-pw2')).toBeVisible();

    await page.fill('#lite-name', '테스트유저');
    await page.fill('#lite-id', TEST_LOGIN_ID);
    await page.fill('#lite-email', TEST_EMAIL);
    await page.fill('#lite-pw', TEST_PASSWORD);
    await page.fill('#lite-pw2', TEST_PASSWORD);
  });

  test('POST /api/user/applications — 월간 구독 신청 성공', async ({ request }) => {
    const res = await request.post(`${BASE_API}/api/user/applications`, {
      data: {
        loginId: `monthly${TS % 1000000}`,
        name: '테스트유저',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        usagePeriod: 1,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('orderId');
    expect(body).toHaveProperty('amount', 4400);
    expect(body).toHaveProperty('orderName');
    expect(body.orderName).toContain('월간');
  });

  test('POST /api/user/applications — 연간 구독 신청 성공', async ({ request }) => {
    const email = `plan.a.annual.${TS}@indptest.com`;
    const res = await request.post(`${BASE_API}/api/user/applications`, {
      data: {
        loginId: `annual${TS % 1000000}`,
        name: '연간유저',
        email,
        password: TEST_PASSWORD,
        usagePeriod: 12,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.amount).toBe(52800);
    expect(body.orderName).toContain('연간');
  });

  test('POST /api/user/applications — 아이디 중복 409', async ({ request }) => {
    // 월간 테스트와 동일한 loginId 재사용
    const res = await request.post(`${BASE_API}/api/user/applications`, {
      data: {
        loginId: `monthly${TS % 1000000}`,
        name: '중복',
        email: `other.${TS}@indptest.com`,
        password: TEST_PASSWORD,
        usagePeriod: 1,
      },
    });
    expect(res.status()).toBe(409);
  });

  test('POST /api/user/applications — 잘못된 usagePeriod 400', async ({ request }) => {
    const res = await request.post(`${BASE_API}/api/user/applications`, {
      data: {
        loginId: `badperiod${TS % 1000000}`,
        name: '오류',
        email: `bad.period.${TS}@test.com`,
        password: TEST_PASSWORD,
        usagePeriod: 3,
      },
    });
    expect(res.status()).toBe(400);
  });

  test('Plan A 사용자 로그인 → userToken 발급', async ({ request }) => {
    // 먼저 계정 생성
    await request.post(`${BASE_API}/api/user/applications`, {
      data: {
        loginId: TEST_LOGIN_ID,
        name: '로그인테스트',
        email: `login.${TS}@indptest.com`,
        password: TEST_PASSWORD,
        usagePeriod: 1,
      },
    });

    const res = await request.post(`${BASE_API}/api/auth/login`, {
      data: { loginId: TEST_LOGIN_ID, password: TEST_PASSWORD },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.planType).toBe('PLAN_A');
    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.storeId).toBeNull();
  });

  test('GET /api/user/subscription — 결제 전 구독 없음 404', async ({ request }) => {
    // 계정 생성
    const loginId = `sub${TS % 1000000}`;
    await request.post(`${BASE_API}/api/user/applications`, {
      data: { loginId, name: '구독테스트', email: `sub.${TS}@indptest.com`, password: TEST_PASSWORD, usagePeriod: 1 },
    });
    const loginRes = await request.post(`${BASE_API}/api/auth/login`, {
      data: { loginId, password: TEST_PASSWORD },
    });
    const { accessToken } = await loginRes.json();

    const res = await request.get(`${BASE_API}/api/user/subscription`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(404);
  });

  test('GET /api/user/payments — 결제 전 빈 배열', async ({ request }) => {
    // 계정 생성
    const loginId = `pay${TS % 1000000}`;
    await request.post(`${BASE_API}/api/user/applications`, {
      data: { loginId, name: '결제내역테스트', email: `pay.${TS}@indptest.com`, password: TEST_PASSWORD, usagePeriod: 1 },
    });
    const loginRes = await request.post(`${BASE_API}/api/auth/login`, {
      data: { loginId, password: TEST_PASSWORD },
    });
    const { accessToken } = await loginRes.json();

    const res = await request.get(`${BASE_API}/api/user/payments`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.payments).toEqual([]);
  });

  test('apply.html → payment.html 이동 흐름 UI', async ({ page }) => {
    const loginId = `ui${TS % 1000000}`;
    const email = `ui.flow.${TS}@indptest.com`;

    await page.goto('/apply.html?plan=A');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#lite-name')).toBeVisible();

    await page.fill('#lite-name', 'UI테스트');
    await page.fill('#lite-id', loginId);

    // 아이디 중복 확인
    await page.click('#btn-id-check');
    await expect(page.locator('#ok-lite-id')).toHaveClass(/show/, { timeout: 5_000 });

    await page.fill('#lite-email', email);
    await page.fill('#lite-pw', TEST_PASSWORD);
    await page.fill('#lite-pw2', TEST_PASSWORD);

    await page.click('button:has-text("다음")');
    await expect(page).toHaveURL(/payment\.html.*plan=A/, { timeout: 10_000 });

    await page.waitForLoadState('networkidle');
    await expect(page.locator('#durationOptions')).toBeVisible({ timeout: 5_000 });
  });

  test('payment.html Plan A — 결제하기 클릭 시 /api/user/applications 호출', async ({ page }) => {
    const loginId = `pay${TS % 1000000 + 1}`;
    const email = `pay.ui.${TS}@indptest.com`;

    await page.goto('/apply.html?plan=A');
    await page.waitForLoadState('networkidle');
    await page.fill('#lite-name', '결제테스트');
    await page.fill('#lite-id', loginId);

    await page.click('#btn-id-check');
    await expect(page.locator('#ok-lite-id')).toHaveClass(/show/, { timeout: 5_000 });

    await page.fill('#lite-email', email);
    await page.fill('#lite-pw', TEST_PASSWORD);
    await page.fill('#lite-pw2', TEST_PASSWORD);
    await page.click('button:has-text("다음")');
    await page.waitForURL(/payment\.html/, { timeout: 10_000 });
    await page.waitForLoadState('networkidle');

    await page.locator('.duration-option').first().click();

    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) await checkbox.click();

    const [apiRes] = await Promise.all([
      page.waitForResponse(
        res => res.url().includes('/api/user/applications') && res.request().method() === 'POST',
        { timeout: 10_000 }
      ),
      page.locator('button:has-text("결제하기")').click(),
    ]);

    expect(apiRes.status()).toBe(201);
    const body = await apiRes.json();
    expect(body).toHaveProperty('orderId');
    expect(body.amount).toBe(4400);
  });

});
