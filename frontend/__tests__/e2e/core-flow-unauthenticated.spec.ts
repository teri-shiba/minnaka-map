import { expect, test } from '@playwright/test'
import { clickFavoriteButton, clickFirstRestaurant, searchStations, waitForSearchResults } from './helpers/search'

test.describe('コアフロー（未認証・正常）', () => {
  test('未認証ユーザーが駅検索からレストラン詳細ページまでたどり着き、お気に入りボタンでログインモーダルが開く', async ({ page }) => {
    await searchStations(page, ['渋谷', '新宿'])

    await waitForSearchResults(page)

    await clickFirstRestaurant(page)

    await clickFavoriteButton(page)

    const authModal = page.getByRole('dialog')
    await expect(authModal).toBeVisible()
    await expect(authModal).toContainText('ログイン')
    await expect(page.getByText('お気に入りの保存にはログインが必要です')).toBeVisible()
  })
})
