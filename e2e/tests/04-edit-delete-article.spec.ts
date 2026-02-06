import { test, expect } from '../utils/fixtures';
import { apiCreateArticle } from '../utils/api';
import { goToArticle, uniqueId } from '../utils/helpers';
import { loadConfig } from '../utils/config';

const config = loadConfig();

test.describe('Edit / Delete Article', () => {
  test('Author can update body and tags', async ({ authenticatedPage, userInfo, request }) => {
    const page = authenticatedPage;
    const articleTitle = `Edit Test ${uniqueId()}`;

    await apiCreateArticle(request, userInfo.token, articleTitle, config.testData.article.description, config.testData.article.body, config.testData.article.tags);

    await goToArticle(page, articleTitle);

    await page.locator('button:has-text("Edit Article")').first().click();
    await page.waitForTimeout(1500);

    const bodyTextarea = page.locator('[placeholder="Write your article (in markdown)"]');
    await bodyTextarea.waitFor({ state: 'visible', timeout: 10000 });
    await bodyTextarea.fill(config.testData.updatedArticle.body);

    const tagInput = page.locator('[placeholder="Enter tags"]');
    for (const tag of config.testData.updatedArticle.tags) {
      await tagInput.fill(tag);
      await tagInput.dispatchEvent('change');
      await page.waitForTimeout(300);
    }

    await page.locator('button:has-text("Publish Article")').click();
    await page.locator('.success-messages:has-text("Published successfully")').waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await page.goto('/#/', { waitUntil: 'domcontentloaded' });
    await goToArticle(page, articleTitle);

    await expect(page.locator('.article-content')).toContainText(config.testData.updatedArticle.body);
    await expect(page.locator(`.tag-list .tag-pill:has-text("${config.testData.updatedArticle.tags[0]}")`)).toBeVisible();
  });

  test('Author can delete an article', async ({ authenticatedPage, userInfo, request }) => {
    const page = authenticatedPage;
    const articleTitle = `Delete Test ${uniqueId()}`;

    await apiCreateArticle(request, userInfo.token, articleTitle, config.testData.article.description, config.testData.article.body);

    await goToArticle(page, articleTitle);

    await page.locator('button:has-text("Delete Article")').first().click();
    await page.waitForTimeout(2000);

    await page.goto('/#/', { waitUntil: 'domcontentloaded' });
    await page.locator('.nav-item a:has(img.user-pic)').click();
    await page.waitForTimeout(2000);

    await expect(page.locator(`.preview-link h1:has-text("${articleTitle}")`)).not.toBeVisible({ timeout: 5000 });
  });
});
