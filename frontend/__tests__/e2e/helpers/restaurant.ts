import type { Page } from '@playwright/test'

/**
 * 最初のレストランのIDを取得する
 * @returns hotpepper_id (例: "J001234567")
 */
export async function getFirstRestaurantId(page: Page): Promise<string> {
  const firstCard = page.getByRole('article').first()
  const link = firstCard.locator('a').first()
  const href = await link.getAttribute('href')

  if (!href) {
    throw new Error('レストランカードのリンクが見つかりません')
  }

  const match = href.match(/restaurant\/([^?]+)/)

  if (!match || !match[1]) {
    throw new Error(`レストランIDを抽出できませんでした: ${href}`)
  }

  return match[1]
}
