import type { Page } from '@playwright/test'

export async function loginWithGoogle(page: Page) {
  const googleLink = page.getByRole('link', { name: /Googleでログイン/ })
  await googleLink.click()

  await page.waitForURL('/')
}
