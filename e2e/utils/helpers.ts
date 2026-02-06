import { Page } from '@playwright/test';

export function uniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

/** Create article via UI. Assumes user is logged in. */
export async function createArticleViaUI(
  page: Page,
  title: string,
  description: string,
  body: string,
  tags: string[] = []
) {
  await page.goto('/#/editor', { waitUntil: 'domcontentloaded' });
  await page.locator('[placeholder="Article Title"]').waitFor({ state: 'visible', timeout: 10000 });

  await page.locator('[placeholder="Article Title"]').fill(title);
  await page.locator('[placeholder="What\'s this article about?"]').fill(description);
  await page.locator('[placeholder="Write your article (in markdown)"]').fill(body);

  // Tag input fires on (change)/blur, not Enter
  for (const tag of tags) {
    const tagInput = page.locator('[placeholder="Enter tags"]');
    await tagInput.fill(tag);
    await tagInput.dispatchEvent('change');
    await page.waitForTimeout(300);
  }

  await page.locator('button:has-text("Publish Article")').click();

  await page.locator('.success-messages:has-text("Published successfully")').waitFor({
    state: 'visible',
    timeout: 10000,
  });
}

/** Navigate to user's profile and open an article by title. */
export async function goToArticle(page: Page, articleTitle: string) {
  const profileLink = page.locator('.nav-item a:has(img.user-pic)');
  await profileLink.click();
  await page.waitForTimeout(1500);

  await page.locator(`.preview-link:has(h1:has-text("${articleTitle}"))`).click();
  await page.locator('.article-page .banner h1').waitFor({ state: 'visible', timeout: 10000 });
}
