import { test, expect } from '@playwright/test';
import { ensureLoggedOut } from '../utils/auth';
import { apiRegisterUser, apiCreateArticle, apiFollowUser, injectToken } from '../utils/api';
import { uniqueId } from '../utils/helpers';
import { loadConfig } from '../utils/config';

const config = loadConfig();

test.describe('Follow Feed', () => {
  test('User A follows User B, User B article appears in User A My Feed', async ({ page, request }) => {
    const idA = uniqueId();
    const idB = uniqueId();
    const userBUsername = `userb_${idB}`;
    const password = config.accounts.userA.password;

    const tokenB = await apiRegisterUser(request, userBUsername, `userb_${idB}@test.com`, password);
    const articleTitle = `Article by B ${idB}`;
    await apiCreateArticle(request, tokenB, articleTitle, config.testData.article.description, config.testData.article.body);

    const tokenA = await apiRegisterUser(request, `usera_${idA}`, `usera_${idA}@test.com`, password);
    await apiFollowUser(request, tokenA, userBUsername);

    await ensureLoggedOut(page);
    await injectToken(page, tokenA);

    await page.locator('.feed-toggle a.nav-link:has-text("My Feed")').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`.preview-link h1:has-text("${articleTitle}")`)).toBeVisible({ timeout: 10000 });
  });
});
