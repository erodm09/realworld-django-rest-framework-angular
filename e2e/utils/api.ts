import { APIRequestContext } from '@playwright/test';
import { loadConfig } from './config';

const config = loadConfig();
const API = config.application.backendUrl;

interface AuthResponse {
  user: { email: string; username: string; token: string };
}

interface ArticleResponse {
  article: { slug: string; title: string };
}

/** Register user via API. Returns auth token. */
export async function apiRegisterUser(
  request: APIRequestContext,
  username: string,
  email: string,
  password: string
): Promise<string> {
  const res = await request.post(`${API}/api/users`, {
    data: { user: { username, email, password } },
  });
  if (!res.ok()) {
    throw new Error(`API register failed (${res.status()}): ${await res.text()}`);
  }
  const body: AuthResponse = await res.json();
  return body.user.token;
}

/** Log in via API. Returns auth token. */
export async function apiLoginUser(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const res = await request.post(`${API}/api/users/login`, {
    data: { user: { email, password } },
  });
  if (!res.ok()) {
    throw new Error(`API login failed (${res.status()}): ${await res.text()}`);
  }
  const body: AuthResponse = await res.json();
  return body.user.token;
}

/** Create article via API. Returns slug. */
export async function apiCreateArticle(
  request: APIRequestContext,
  token: string,
  title: string,
  description: string,
  body: string,
  tags: string[] = []
): Promise<string> {
  const res = await request.post(`${API}/api/articles`, {
    headers: { Authorization: `Token ${token}` },
    data: { article: { title, description, body, tagList: tags } },
  });
  if (!res.ok()) {
    throw new Error(`API create article failed (${res.status()}): ${await res.text()}`);
  }
  const json: ArticleResponse = await res.json();
  return json.article.slug;
}

/** Follow user via API. */
export async function apiFollowUser(
  request: APIRequestContext,
  token: string,
  username: string
): Promise<void> {
  const res = await request.post(`${API}/api/profiles/${username}/follow`, {
    headers: { Authorization: `Token ${token}` },
    data: {},
  });
  if (!res.ok()) {
    throw new Error(`API follow failed (${res.status()}): ${await res.text()}`);
  }
}

/** Inject auth token into localStorage and reload. */
export async function injectToken(page: import('@playwright/test').Page, token: string) {
  await page.goto('/#/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => localStorage.setItem('token', t), token);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('a.nav-link:has-text("New Article")').waitFor({ state: 'visible', timeout: 10000 });
}
