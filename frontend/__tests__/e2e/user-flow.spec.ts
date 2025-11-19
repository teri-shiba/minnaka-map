import { expect, test } from '@playwright/test'
import { searchStations } from './helpers/search'

test.describe('中間地点の検索フロー', () => {
  test('検索 → 結果表示 → 詳細画面遷移の一連フロー', async ({ page }) => {
    // 出発駅を指定 & 検索
    await searchStations(page, ['渋谷', '新宿'])

    // 検索結果ページの表示を待機
    await page.waitForURL(/\/result\?/)

    // 地図の表示確認
    await expect(page.getByRole('region', { name: '検索結果の地図' })).toBeVisible()

    // レストランカードの表示確認
    const restaurantCard = page.getByRole('article').first()
    await expect(restaurantCard).toBeVisible()

    // レストラン詳細ページへ遷移
    await restaurantCard.click()
    await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

    // 詳細ページの確認（店舗名・基本情報）
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: '店舗基本情報' })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: '席・設備' })).toBeVisible()
    await expect(page.getByRole('table')).toHaveCount(2)

    // アクションボタンの存在確認
    const shareButton = page.getByRole('button', { name: /シェア/ })
    await expect(shareButton).toBeVisible()

    const favoriteButton = page.getByRole('button', { name: /保存/ })
    await expect(favoriteButton).toBeVisible()
  })
})
