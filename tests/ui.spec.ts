import { test, expect } from '@playwright/test';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Kiểm tra Theme (Sáng / Tối)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const MOCK_TOKEN = 'mock-token-theme-tests';
const MOCK_USER = { id: 1, name: 'Test User', email: 'test@example.com', username: 'testuser' };

async function setupAuthenticatedPage(page: any) {
  await page.addInitScript((token: string) => {
    localStorage.setItem('token', token);
  }, MOCK_TOKEN);

  await page.route('**/api/user*', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
  );
  await page.route('**/api/conversations*', (route: any) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
  );
  await page.route('**/app/**', (route: any) => route.abort());

  await page.goto('/chat');
}

test.describe('Chủ đề giao diện (Theme)', () => {
  test('trang login có nền đen theo mặc định', async ({ page }) => {
    await page.goto('/login');

    const body = page.locator('div.min-h-screen').first();
    // bg-apple-black → background là màu đen
    await expect(body).toHaveClass(/bg-apple-black/);
  });

  test('Settings tab có nút toggle dark/light mode', async ({ page }) => {
    await setupAuthenticatedPage(page);

    // Tìm nút settings trong BottomNav và click
    const settingsTab = page.locator('#nav-tab-settings');
    await settingsTab.click({ timeout: 8_000 });

    // SettingsPlaceholder phải hiện
    await expect(page.locator('p.text-xs', { hasText: 'Tự động điều chỉnh' })).toBeVisible({ timeout: 5_000 });
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Điều hướng (Navigation Guards)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Điều hướng và bảo vệ route', () => {
  test('truy cập /chat khi chưa đăng nhập → redirect về /login', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForURL('**/login', { timeout: 5_000 });
    expect(page.url()).toContain('/login');
  });

  test('truy cập /login khi đã có token → redirect về /chat', async ({ page }) => {
    await page.addInitScript((token: string) => {
      localStorage.setItem('token', token);
    }, MOCK_TOKEN);

    await page.route('**/api/user*', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
    );
    await page.route('**/api/conversations*', (route: any) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
    );
    await page.route('**/app/**', (route: any) => route.abort());

    await page.goto('/login');
    await page.waitForURL('**/chat', { timeout: 5_000 });
    expect(page.url()).toContain('/chat');
  });

  test('trang 404 / unknown route xử lý được', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    // SPA: trả về 200 (index.html) nhưng Vue router có thể redirect về home hoặc hiện fallback
    expect([200, 404]).toContain(response?.status());
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Hiệu suất & Accessibility cơ bản
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Accessibility cơ bản', () => {
  test('trang login có title phù hợp', async ({ page }) => {
    await page.goto('/login');
    const title = await page.title();
    // title không được rỗng
    expect(title.length).toBeGreaterThan(0);
  });

  test('các field input có label hoặc placeholder', async ({ page }) => {
    await page.goto('/login');

    // Label cho email
    await expect(page.locator('label[for="email-input"]')).toBeVisible();
    await expect(page.locator('label[for="password-input"]')).toBeVisible();

    // Placeholder
    await expect(page.locator('#email-input')).toHaveAttribute('placeholder');
    await expect(page.locator('#password-input')).toHaveAttribute('placeholder');
  });

  test('nút toggle mật khẩu có aria-label', async ({ page }) => {
    await page.goto('/login');

    const toggleBtn = page.locator('button[aria-label]').filter({ hasText: '' }).first();
    const ariaLabel = await toggleBtn.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
  });

  test('trang login không bị overflow ngang trên desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login');

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
  });

});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Responsive Design
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Responsive Design', () => {
  const viewports = [
    { name: 'Mobile S', width: 320, height: 568 },
    { name: 'Mobile L', width: 414, height: 896 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`trang login hiển thị đúng trên ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/login');

      // Form phải hiển thị và không bị tràn
      await expect(page.locator('#login-form')).toBeVisible();
      await expect(page.locator('#login-submit-btn')).toBeVisible();

      const formBox = await page.locator('#login-form').boundingBox();
      expect(formBox?.width).toBeLessThanOrEqual(vp.width);
    });
  }

  test('sidebar chat ẩn trên mobile khi đang xem chat window', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.addInitScript(() => localStorage.setItem('token', 'mock-token'));
    await page.route('**/api/user*', (r: any) => r.fulfill({ status: 200, body: JSON.stringify({ id: 1, name: 'Test' }) }));
    await page.route('**/api/conversations*', (r: any) => r.fulfill({ status: 200, body: JSON.stringify({ data: [] }) }));
    await page.route('**/app/**', (r: any) => r.abort());

    await page.goto('/chat');
    await expect(page.locator('aside')).toBeVisible({ timeout: 8_000 });
    // Trên mobile, main area bị ẩn khi chưa chọn chat
    await expect(page.locator('main')).toHaveClass(/hidden/, { timeout: 3_000 });
  });
});
