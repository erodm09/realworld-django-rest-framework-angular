import { test, expect } from '@playwright/test';
import { registerUserViaUI, loginUserViaUI, ensureLoggedOut } from '../utils/auth';
import { apiRegisterUser } from '../utils/api';
import { uniqueId } from '../utils/helpers';
import { loadConfig } from '../utils/config';

const config = loadConfig();

test.describe('Sign-up & Login', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedOut(page);
  });

  test('Register a new user', async ({ page }) => {
    const id = uniqueId();
    await registerUserViaUI(page, `user_${id}`, `user_${id}@test.com`, config.accounts.userA.password);

    await expect(page).toHaveURL(/login/);
    await expect(page.locator('h1:has-text("Sign in")')).toBeVisible();
  });

  test('Log in successfully', async ({ page, request }) => {
    const id = uniqueId();
    const username = `user_${id}`;
    const email = `user_${id}@test.com`;
    const password = config.accounts.userA.password;

    await apiRegisterUser(request, username, email, password);
    await loginUserViaUI(page, email, password);

    await expect(page.locator('a.nav-link:has-text("New Article")')).toBeVisible();
    await expect(page.locator('.nav-item a:has(img.user-pic)')).toContainText(username);
  });

  test('Login with wrong password shows error', async ({ page, request }) => {
    const id = uniqueId();
    const email = `user_${id}@test.com`;

    await apiRegisterUser(request, `user_${id}`, email, config.accounts.userA.password);

    await page.goto('/#/login', { waitUntil: 'domcontentloaded' });
    await page.locator('[placeholder="Email"]').fill(email);
    await page.locator('[placeholder="Password"]').fill(config.accounts.wrongPassword);

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/users/login'),
      { timeout: 10000 }
    );

    await page.locator('button:has-text("Sign in")').click();

    const response = await responsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(400);

    await expect(page.locator('a.nav-link:has-text("New Article")')).not.toBeVisible({ timeout: 3000 });
  });
});
