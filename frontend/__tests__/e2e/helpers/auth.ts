import type { Page } from '@playwright/test'

export async function loginWithGoogle(page: Page) {
  await page.getByRole('button', { name: 'ログイン' }).click()
  await page.getByRole('link', { name: /Googleでログイン/ }).click()

  await page.getByRole('button', { name: 'ユーザーメニュー' }).waitFor()
}
