const ADMIN = { id: 'admin', password: 'admin' };
const CREATOR = { email: 'indp.test.dj@gmail.com', password: 'testbot123!' };

async function loginAsAdmin(page) {
  await page.goto('/admin-login.html');
  await page.fill('#admin-id', ADMIN.id);
  await page.fill('#admin-pw', ADMIN.password);
  await page.click('#login-btn');
  await page.waitForURL('**/admin-dashboard.html**', { timeout: 10_000 });
}

async function loginAsCreator(page) {
  await page.goto('/login.html');
  await page.waitForSelector('#login-id', { state: 'visible' });
  await page.fill('#login-id', CREATOR.email);
  await page.fill('#login-pw', CREATOR.password);

  const responsePromise = page.waitForResponse(
    res => res.url().includes('/api/auth/login'),
    { timeout: 15_000 }
  );
  await page.click('#btn-login');
  const res = await responsePromise;

  if (res.status() === 401) {
    throw new Error(
      '⚠️  크리에이터 계정 재생성 필요: 관리자에서 pw4478@nate.com 계정을 삭제 후 재생성해 주세요.'
    );
  }
  await page.waitForURL('**/dj-dashboard.html**', { timeout: 10_000 });
}

export { ADMIN, CREATOR, loginAsAdmin, loginAsCreator };
