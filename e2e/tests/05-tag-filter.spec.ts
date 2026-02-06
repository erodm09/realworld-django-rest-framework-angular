import { test, expect } from '../utils/fixtures';
import { apiCreateArticle } from '../utils/api';
import { uniqueId } from '../utils/helpers';
import { loadConfig } from '../utils/config';

const config = loadConfig();
const filterTag = config.testData.filterTag;

test.describe('Tag Filter', () => {
  test('Click a tag in sidebar filters articles by that tag', async ({ authenticatedPage, userInfo, request }) => {
    const page = authenticatedPage;
    const articleTitle = `Tag Filter Test ${uniqueId()}`;

    await apiCreateArticle(request, userInfo.token, articleTitle, config.testData.article.description, config.testData.article.body, config.testData.article.tags);

    await page.locator('.feed-toggle a.nav-link:has-text("Global Feed")').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`.preview-link h1:has-text("${articleTitle}")`)).toBeVisible({ timeout: 10000 });

    const sidebarTag = page.locator(`.sidebar .tag-pill:has-text("${filterTag}")`).first();
    await sidebarTag.waitFor({ state: 'visible', timeout: 10000 });
    await sidebarTag.click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`.feed-toggle a.nav-link.active:has-text("#${filterTag}")`)).toBeVisible();
    await expect(page.locator(`.preview-link h1:has-text("${articleTitle}")`)).toBeVisible({ timeout: 10000 });
  });
});
