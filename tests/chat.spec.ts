import { test, expect } from '@playwright/test';
import { setupAuthenticatedPage, MOCK_CONVERSATIONS } from './helpers/auth';

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Giao diện Chat chính (Home.vue)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Giao diện Chat chính', () => {
  test('hiển thị sidebar với tiêu đề YuiChat', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await expect(page.locator('h1', { hasText: 'YuiChat' })).toBeVisible({ timeout: 8_000 });
  });

  test('hiển thị danh sách cuộc hội thoại sau khi load', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await expect(page.locator('text=Tran Thi B')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=Nhóm Học Tập')).toBeVisible();
  });

  test('hiển thị badge số tin nhắn chưa đọc', async ({ page }) => {
    await setupAuthenticatedPage(page);

    // Conversation 1 có unread = 2
    await expect(page.locator('span', { hasText: '2' }).first()).toBeVisible({ timeout: 8_000 });
  });

  test('hiển thị tin nhắn cuối cùng trong danh sách', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await expect(page.locator('text=Xin chào bạn!')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=Bài tập về nhà xong chưa?')).toBeVisible();
  });

  test('chọn cuộc hội thoại mở cửa sổ chat', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.locator('text=Tran Thi B').first().click({ timeout: 8_000 });

    // Sau khi click, ChatWindow phải hiện — kiểm tra có tin nhắn mock
    await expect(page.locator('text=Xin chào!').first()).toBeVisible({ timeout: 8_000 });
  });

  test('empty state hiển thị khi chưa chọn cuộc hội thoại (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await setupAuthenticatedPage(page);

    await expect(page.locator('text=Chào mừng đến YuiChat')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=Chọn một cuộc trò chuyện')).toBeVisible();
  });

  test('sidebar ẩn trên mobile khi mở chat window', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setupAuthenticatedPage(page);

    await expect(page.locator('h1', { hasText: 'YuiChat' })).toBeVisible({ timeout: 8_000 });
    await page.locator('text=Tran Thi B').first().click();

    // Trên mobile, aside có class hidden khi chat window mở
    await expect(page.locator('aside').first()).toHaveClass(/hidden/, { timeout: 5_000 });
  });

  test('danh sách cuộc hội thoại hiển thị đúng thứ tự (mới nhất trước)', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await expect(page.locator('text=Tran Thi B')).toBeVisible({ timeout: 8_000 });

    // Cuộc hội thoại đầu tiên phải là cuộc mới nhất (conversation 1)
    const firstItem = page.locator('button[class*="flex items-center"]').first();
    await expect(firstItem).toContainText('Tran Thi B');
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Thanh tìm kiếm (SearchBar)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Thanh tìm kiếm người dùng', () => {
  const API = 'http://localhost:8000/api';

  test('hiển thị input tìm kiếm trong sidebar', async ({ page }) => {
    await setupAuthenticatedPage(page);

    const searchInput = page.locator('#chat-search-input');
    await expect(searchInput).toBeVisible({ timeout: 8_000 });
    await expect(searchInput).toHaveAttribute('placeholder', 'Tìm kiếm...');
  });

  test('hiển thị dropdown kết quả tìm kiếm sau khi gõ', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.route('**/api/search*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 5, name: 'Pham Thi D', username: 'thid', avatar: null }]),
      })
    );

    const searchInput = page.locator('#chat-search-input');
    await searchInput.waitFor({ timeout: 8_000 });
    await searchInput.fill('Pham');

    await expect(page.locator('text=Pham Thi D')).toBeVisible({ timeout: 3_000 });
    await expect(page.locator('text=@thid')).toBeVisible();
  });

  test('hiển thị spinner "Đang tìm kiếm..." khi API đang phản hồi', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.route('**/api/search*', async (route) => {
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });

    const searchInput = page.locator('#chat-search-input');
    await searchInput.waitFor({ timeout: 8_000 });
    await searchInput.fill('test');

    await expect(page.locator('text=Đang tìm kiếm...')).toBeVisible({ timeout: 2_000 });
  });

  test('dropdown ẩn khi xóa text tìm kiếm', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.route('**/api/search*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ id: 5, name: 'Pham Thi D', username: 'thid', avatar: null }]),
      })
    );

    const searchInput = page.locator('#chat-search-input');
    await searchInput.waitFor({ timeout: 8_000 });
    await searchInput.fill('Pham');
    await expect(page.locator('text=Pham Thi D')).toBeVisible({ timeout: 3_000 });

    await searchInput.clear();
    await expect(page.locator('text=Pham Thi D')).not.toBeVisible({ timeout: 2_000 });
  });

  test('nút tạo nhóm hiển thị bên cạnh thanh tìm kiếm', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await expect(page.locator('button[title="Tạo nhóm chat"]')).toBeVisible({ timeout: 8_000 });
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Nhập và gửi tin nhắn
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Nhập và gửi tin nhắn', () => {
  test('hiển thị tin nhắn trong cửa sổ chat', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.locator('text=Tran Thi B').first().click({ timeout: 8_000 });

    await expect(page.locator('text=Xin chào!')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('text=Chào bạn, bạn khỏe không?')).toBeVisible();
  });

  test('gửi tin nhắn bằng nút submit — input bị xóa sau khi gửi', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.locator('text=Tran Thi B').first().click({ timeout: 8_000 });

    const chatInput = page.locator('#chat-message-input');
    await chatInput.waitFor({ timeout: 8_000 });
    await chatInput.fill('Tin nhắn test tự động');

    // Click nút gửi (button có icon send)
    await page.locator('#chat-send-btn').click();

    await expect(chatInput).toHaveValue('', { timeout: 5_000 });
  });

  test('gửi tin nhắn bằng phím Enter', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.locator('text=Tran Thi B').first().click({ timeout: 8_000 });

    const chatInput = page.locator('#chat-message-input');
    await chatInput.waitFor({ timeout: 8_000 });
    await chatInput.fill('Tin nhắn Enter test');
    await chatInput.press('Enter');

    await expect(chatInput).toHaveValue('', { timeout: 5_000 });
  });

  test('không gửi tin nhắn rỗng', async ({ page }) => {
    await setupAuthenticatedPage(page);
    await page.locator('text=Tran Thi B').first().click({ timeout: 8_000 });

    const chatInput = page.locator('#chat-message-input');
    await chatInput.waitFor({ timeout: 8_000 });

    // Đảm bảo input rỗng
    await chatInput.fill('');
    const submitBtn = page.locator('#chat-send-btn');
    
    // Nút submit không hiển thị khi input rỗng
    const isVisible = await submitBtn.isVisible();
    expect(isVisible).toBe(false);
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Modal tạo nhóm chat
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Modal tạo nhóm chat', () => {
  test('mở modal khi click nút tạo nhóm', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.locator('button[title="Tạo nhóm chat"]').click({ timeout: 8_000 });

    await expect(page.locator('h2', { hasText: 'Tạo nhóm mới' })).toBeVisible({ timeout: 3_000 });
  });

  test('đóng modal bằng nút Huỷ', async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.locator('button[title="Tạo nhóm chat"]').click({ timeout: 8_000 });
    await expect(page.locator('h2', { hasText: 'Tạo nhóm mới' })).toBeVisible({ timeout: 3_000 });

    await page.locator('button', { hasText: 'Huỷ' }).click();
    await expect(page.locator('h2', { hasText: 'Tạo nhóm mới' })).not.toBeVisible({ timeout: 3_000 });
  });
});

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  TEST SUITE: Route Guard
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
test.describe('Bảo vệ route', () => {
  test('truy cập /chat khi chưa đăng nhập → redirect về /login', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/chat');
    await page.waitForURL('**/login', { timeout: 5_000 });
    expect(page.url()).toContain('/login');
  });
});
