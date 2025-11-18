import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { clickFavoriteButton, clickFirstRestaurant, searchStations, waitForSearchResults } from './helpers/search'

test.describe('認証制御フロー', () => {
  test('ログイン後、検索結果から任意のレストランをお気に入り登録/解除できる', async ({ page }) => {
    await searchStations(page, ['渋谷', '新宿'])
    await waitForSearchResults(page)

    await clickFirstRestaurant(page)

    await clickFavoriteButton(page)

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    await expect(page.getByText('お気に入りの保存にはログインが必要です')).toBeVisible()

    await loginWithGoogle(page)
    await expect(page).toHaveURL('/')

    await searchStations(page, ['渋谷', '新宿'])
    await waitForSearchResults(page)

    await clickFirstRestaurant(page)

    const favoriteButton = page.getByRole('button', { name: /保存/ })
    await expect(favoriteButton).toBeVisible()

    const initialLabel = (await favoriteButton.textContent())?.trim() ?? ''
    const isAlreadyFavorited = initialLabel.includes('保存済み')

    await clickFavoriteButton(page)

    if (isAlreadyFavorited) {
      // すでにお気に入り済みだった場合: 「削除」→「追加」
      await expect(page.getByText('お気に入りから削除しました')).toBeVisible()
      await expect(page.getByRole('button', { name: '保存する' })).toBeVisible()

      await clickFavoriteButton(page)

      await expect(page.getByText('お気に入りに追加しました')).toBeVisible()
      await expect(page.getByRole('button', { name: '保存済み' })).toBeVisible()
    }
    else {
      // まだお気に入りではなかった場合: 1回目のクリックで「追加」
      await expect(page.getByText('お気に入りに追加しました')).toBeVisible()
      await expect(page.getByRole('button', { name: '保存済み' })).toBeVisible()
    }
  })
})
