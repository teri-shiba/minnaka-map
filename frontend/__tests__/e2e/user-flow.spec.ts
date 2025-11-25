import { expect, test } from '@playwright/test'
import { searchStations } from './helpers/search'

test.describe('中間地点の検索フロー', () => {
  test('検索 → 結果表示 → 詳細画面遷移の一連フロー', async ({ page }) => {
    await searchStations(page, ['渋谷', '新宿'])

    await page.waitForURL(/\/result\?/)

    await expect(page.getByRole('region', { name: '検索結果の地図' })).toBeVisible()

    const restaurantCard = page.getByRole('article').first()
    await expect(restaurantCard).toBeVisible()

    await restaurantCard.click()
    await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: '店舗基本情報' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: '席・設備' })).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(2)

    const shareButton = page.getByRole('button', { name: /シェア/ })
    await expect(shareButton).toBeVisible()

    const favoriteButton = page.getByRole('button', { name: /保存/ })
    await expect(favoriteButton).toBeVisible()
  })
})
