import { test, expect } from '@playwright/test';

const API = 'http://localhost:8000/api';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Trang đăng nhập (LoginView)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

test.describe('Trang đăng nhập', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/login');
  });

  test('hiển thị đúng tiêu đề và các phần tử quan trọng', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('YuiChat');
    await expect(page.locator('p', { hasText: 'Đăng nhập để bắt đầu' })).toBeVisible();
    await expect(page.locator('#email-input')).toBeVisible();
    await expect(page.locator('#password-input')).toBeVisible();
    await expect(page.locator('#login-submit-btn')).toContainText('Đăng nhập');
    await expect(page.locator('a', { hasText: 'Quên mật khẩu?' })).toBeVisible();
    await expect(page.locator('footer')).toContainText('YuiChat');
  });

  test('toggle hiện / ẩn mật khẩu', async ({ page }) => {
    const passwordInput = page.locator('#password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await page.locator('button[aria-label="Hiện mật khẩu"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(page.locator('button[aria-label="Ẩn mật khẩu"]')).toBeVisible();

    await page.locator('button[aria-label="Ẩn mật khẩu"]').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('nút đăng nhập disabled và hiện spinner khi đang loading', async ({ page }) => {
    // Mock API với delay 2s
    await page.route('**/api/login*', async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 401, body: JSON.stringify({ message: 'Unauthorized' }) });
    });

    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('password123');
    await page.locator('#login-submit-btn').click();

    await expect(page.locator('#login-submit-btn')).toBeDisabled();
    await expect(page.locator('#login-submit-btn')).toContainText('Đang kiểm tra');
  });

  test('hiển thị lỗi khi thông tin đăng nhập sai', async ({ page }) => {
    await page.route('**/api/login*', (route) =>
      route.fulfill({ status: 422, contentType: 'application/json', body: JSON.stringify({ message: 'Email hoặc mật khẩu không chính xác.' }) })
    );

    await page.locator('#email-input').fill('wrong@example.com');
    await page.locator('#password-input').fill('wrongpass');
    await page.locator('#login-submit-btn').click();

    await expect(page.locator('p', { hasText: 'không chính xác' })).toBeVisible({ timeout: 8_000 });
  });

  test('chuyển hướng đến /chat khi đăng nhập thành công', async ({ page }) => {
    // Mock login
    await page.route('**/api/login*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ access_token: 'new-token-123', user: { id: 1, name: 'Test User', email: 'test@example.com' } }),
      })
    );
    // Mock các API cần thiết sau login
    await page.route('**/api/user*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ id: 1, name: 'Test User' }) }));
    await page.route('**/api/conversations*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/friends*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/notifications*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/notifications/unread-count*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ count: 0 }) }));
    await page.route('**/api/friendship/states*', (route) => route.fulfill({ status: 200, body: JSON.stringify({}) }));
    await page.route('**/api/heartbeat*', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route(/ws:\/\/.*|wss:\/\/.*/, (route) => route.abort());
    await page.route(/\/broadcasting\/auth/, (route) => route.fulfill({ status: 200, body: '{}' }));

    await page.locator('#email-input').fill('test@example.com');
    await page.locator('#password-input').fill('password123');
    await page.locator('#login-submit-btn').click();

    await page.waitForURL('**/chat', { timeout: 10_000 });
    expect(page.url()).toContain('/chat');
  });

  test('đã có token → tự động redirect về /chat', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('token', 'existing-token'));
    await page.route('**/api/user*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ id: 1, name: 'Test' }) }));
    await page.route('**/api/conversations*', (route) => route.fulfill({ status: 200, body: JSON.stringify({ data: [] }) }));
    await page.route('**/api/friends*', (route) => route.fulfill({ status: 200, body: '{"data":[]}' }));
    await page.route('**/api/notifications*', (route) => route.fulfill({ status: 200, body: '{"data":[]}' }));
    await page.route('**/api/notifications/unread-count*', (route) => route.fulfill({ status: 200, body: '{"count":0}' }));
    await page.route('**/api/friendship/states*', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route('**/api/heartbeat*', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route(/ws:\/\/.*|wss:\/\/.*/, (route) => route.abort());

    await page.goto('/login');
    await page.waitForURL('**/chat', { timeout: 8_000 });
    expect(page.url()).toContain('/chat');
  });

  test('giao diện không bị tràn ngang trên mobile (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(390);
  });
});
