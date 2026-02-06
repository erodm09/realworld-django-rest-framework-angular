import { Page } from '@playwright/test';

export async function ensureLoggedOut(page: Page) {
  await page.goto('/#/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('token'));
  await page.goto('/#/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
}

/** Register via UI. App redirects to /login after 2s. */
export async function registerUserViaUI(page: Page, username: string, email: string, password: string) {
  await page.goto('/#/register', { waitUntil: 'domcontentloaded' });
  await page.locator('[placeholder="Username"]').fill(username);
  await page.locator('[placeholder="Email"]').fill(email);
  await page.locator('[placeholder="Password"]').fill(password);
  await page.locator('button:has-text("Sign up")').click();

  await page.locator('.success-messages').waitFor({ state: 'visible', timeout: 10000 });

  await page.waitForURL('**/login', { timeout: 5000 });
}

/** Log in via UI. Waits for nav to confirm auth. */
export async function loginUserViaUI(page: Page, email: string, password: string) {
  await page.goto('/#/login', { waitUntil: 'domcontentloaded' });
  await page.locator('[placeholder="Email"]').fill(email);
  await page.locator('[placeholder="Password"]').fill(password);
  await page.locator('button:has-text("Sign in")').click();

  await page.locator('a.nav-link:has-text("New Article")').waitFor({ state: 'visible', timeout: 10000 });
}
