import { Page } from '@playwright/test';

/**
 * Token localStorage key — phải khớp với auth.js store
 */
export const TOKEN_KEY = 'token';
export const MOCK_TOKEN = 'mock-bearer-token-for-playwright';

/**
 * Mock user data
 */
export const MOCK_USER = {
  id: 1,
  name: 'Nguyen Van A',
  email: 'test@example.com',
  username: 'vana',
  avatar: null,
};

/**
 * Mock conversations
 */
export const MOCK_CONVERSATIONS = [
  {
    id: 1,
    is_group: false,
    name: null,
    avatar: null,
    unread: 2,
    updated_at: new Date().toISOString(),
    last_message: { content: 'Xin chào bạn!', created_at: new Date().toISOString() },
    participants: [
      { user_id: 1, user: MOCK_USER },
      {
        user_id: 2,
        user: {
          id: 2,
          name: 'Tran Thi B',
          email: 'b@example.com',
          username: 'thib',
          avatar: null,
          is_online: true,
        },
      },
    ],
  },
  {
    id: 2,
    is_group: true,
    name: 'Nhóm Học Tập',
    avatar: null,
    unread: 0,
    updated_at: new Date(Date.now() - 3_600_000).toISOString(),
    last_message: {
      content: 'Bài tập về nhà xong chưa?',
      created_at: new Date(Date.now() - 3_600_000).toISOString(),
    },
    participants: [
      { user_id: 1, user: MOCK_USER },
      {
        user_id: 3,
        user: { id: 3, name: 'Le Van C', email: 'c@example.com', username: 'vanc', avatar: null, is_online: false },
      },
    ],
  },
];

/**
 * Mock messages for conversation #1
 */
export const MOCK_MESSAGES = [
  { id: 1, content: 'Xin chào!', user_id: 2, created_at: new Date().toISOString() },
  { id: 2, content: 'Chào bạn, bạn khỏe không?', user_id: 1, created_at: new Date().toISOString() },
];

/**
 * Setup a fully mocked authenticated session.
 *
 * - Injects `token` into localStorage via addInitScript (runs before page JS)
 * - Mocks all backend API routes to return mock data
 * - Aborts WebSocket/Reverb connections to prevent noise
 */
export async function setupAuthenticatedPage(page: Page) {
  // Inject token before any JS runs
  await page.addInitScript(
    ({ key, token }: { key: string; token: string }) => {
      localStorage.setItem(key, token);
    },
    { key: TOKEN_KEY, token: MOCK_TOKEN }
  );

  // API base is http://localhost:8000/api (dynamic hostname from window.location.hostname)
  const API = 'http://localhost:8000/api';

  // GET /user
  await page.route('**/api/user*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
  );

  // GET and POST /conversations
  await page.route('**/api/conversations*', (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CONVERSATIONS),
      });
    } else if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CONVERSATIONS[0]),
      });
    } else {
      route.continue();
    }
  });

  // GET /conversations/:id/messages
  await page.route(/\/api\/conversations\/\d+\/messages/, (route) => {
    if (route.request().method() === 'GET') {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: MOCK_MESSAGES, meta: { current_page: 1, last_page: 1 } }),
      });
    } else if (route.request().method() === 'POST') {
      const body = JSON.parse(route.request().postData() || '{}');
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 99, content: body.content, user_id: 1, created_at: new Date().toISOString() }),
      });
    } else {
      route.continue();
    }
  });

  // GET /conversations/:id (single conversation)
  await page.route(/\/api\/conversations\/\d+$/, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_CONVERSATIONS[0]),
    });
  });

  // POST /heartbeat
  await page.route('**/api/heartbeat*', (route) =>
    route.fulfill({ status: 200, body: '{}' })
  );

  // Friendship & notifications (to avoid errors on load)
  await page.route('**/api/friends*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) })
  );
  await page.route('**/api/notifications*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [], unread_count: 0 }) })
  );
  await page.route('**/api/notifications/unread-count*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ count: 0 }) })
  );
  await page.route('**/api/friendship/states*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
  );

  // Abort WebSocket / Reverb connections
  await page.route(/ws:\/\/.*|wss:\/\/.*/, (route) => route.abort());
  await page.route(/\/broadcasting\/auth/, (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ auth: 'mock' }) })
  );

  await page.goto('/chat');
}
