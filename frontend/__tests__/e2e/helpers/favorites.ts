import type { Page } from '@playwright/test'

export async function cleanupFavorites(page: Page) {
  await page.goto('/favorites')

  while (await page.getByRole('article').count() > 0) {
    await page.getByRole('article').first().getByRole('button').click()
    await page.getByText('お気に入りから削除しました').waitFor({ state: 'visible' })
    await page.reload()
  }
}
