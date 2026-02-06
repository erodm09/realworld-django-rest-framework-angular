import { test as base, Page } from '@playwright/test';
import { apiRegisterUser } from './api';
import { ensureLoggedOut } from './auth';
import { uniqueId } from './helpers';
import { loadConfig } from './config';

const config = loadConfig();

export type UserInfo = {
  username: string;
  email: string;
  password: string;
  token: string;
};

type CustomFixtures = {
  userInfo: UserInfo;
  authenticatedPage: Page;
};

export const test = base.extend<CustomFixtures>({
  userInfo: async ({ request }, use) => {
    const id = uniqueId();
    const username = `user_${id}`;
    const email = `user_${id}@test.com`;
    const password = config.accounts.userA.password;
    const token = await apiRegisterUser(request, username, email, password);
    await use({ username, email, password, token });
  },

  authenticatedPage: async ({ page, userInfo }, use) => {
    await ensureLoggedOut(page);
    await page.goto('/#/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((t) => localStorage.setItem('token', t), userInfo.token);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('a.nav-link:has-text("New Article")').waitFor({ state: 'visible', timeout: 10000 });
    await use(page);
  },
});

export { expect } from '@playwright/test';
