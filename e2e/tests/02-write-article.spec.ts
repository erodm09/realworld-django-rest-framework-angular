import { test, expect } from '../utils/fixtures';
import { createArticleViaUI, uniqueId } from '../utils/helpers';
import { loadConfig } from '../utils/config';

const config = loadConfig();

test.describe('Write Article', () => {
  test('Create an article and verify it appears in My Articles', async ({ authenticatedPage, userInfo }) => {
    const page = authenticatedPage;
    const articleTitle = `Test Article ${uniqueId()}`;

    await createArticleViaUI(page, articleTitle, config.testData.article.description, config.testData.article.body, config.testData.article.tags);

    await page.goto('/#/', { waitUntil: 'domcontentloaded' });
    await page.locator('.nav-item a:has(img.user-pic)').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`.preview-link h1:has-text("${articleTitle}")`)).toBeVisible({ timeout: 10000 });
  });
});
