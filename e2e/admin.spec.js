/**
 * 섹션 1: 어드민
 * - 로그인
 * - 크리에이터 목록 조회
 * - 크리에이터 계정 생성
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './helpers/auth.js';

const TEST_CREATOR = {
  name: '테스트봇',
  djName: 'DJ TestBot',
  phone: '010-0000-9999',
  email: `testbot_${Date.now()}@indptest.com`,
  password: 'testbot123!',
};

test.describe('어드민 섹션', () => {

  test('어드민 로그인 성공', async ({ page }) => {
    await page.goto('/admin-login.html');
    await page.fill('#admin-id', 'admin');
    await page.fill('#admin-pw', 'admin');
    await page.click('#login-btn');
    await expect(page).toHaveURL(/admin-dashboard/, { timeout: 10_000 });
  });

  test('어드민 로그인 실패 — 잘못된 비밀번호', async ({ page }) => {
    await page.goto('/admin-login.html');
    await page.fill('#admin-id', 'admin');
    await page.fill('#admin-pw', 'wrong_password');
    await page.click('#login-btn');
    await expect(page.locator('#auth-error')).toBeVisible({ timeout: 5_000 });
  });

  test('크리에이터 탭 진입 및 목록 조회', async ({ page }) => {
    await loginAsAdmin(page);
    // 계정 생성 탭 클릭
    await page.locator('a.nav-item', { hasText: '계정 생성' }).click();
    // 크리에이터 계정 생성 섹션 노출 확인
    await expect(page.locator('#ac-name')).toBeVisible({ timeout: 5_000 });
  });

  test('크리에이터 계정 생성', async ({ page }) => {
    await loginAsAdmin(page);

    // 크리에이터 탭으로 이동
    await page.locator('a.nav-item', { hasText: '계정 생성' }).click();
    await expect(page.locator('#ac-name')).toBeVisible({ timeout: 5_000 });

    // 폼 입력
    await page.fill('#ac-name', TEST_CREATOR.name);
    await page.fill('#ac-dj-name', TEST_CREATOR.djName);
    await page.fill('#ac-phone', TEST_CREATOR.phone);
    await page.fill('#ac-email', TEST_CREATOR.email);
    await page.fill('#ac-pw', TEST_CREATOR.password);
    await page.fill('#ac-pw2', TEST_CREATOR.password);

    // API 요청 감시
    const [response] = await Promise.all([
      page.waitForResponse(res =>
        res.url().includes('/api/admin/creators') && res.request().method() === 'POST'
      ),
      page.click('#ac-submit-btn'),
    ]);

    expect(response.status()).toBe(201);
  });

});
