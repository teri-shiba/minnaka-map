import { expect, test } from '@playwright/test'

test.describe('コアフロー（未認証・正常）', () => {
  test('未認証ユーザーが駅検索からレストラン詳細ページまでたどり着き、お気に入りボタンでログインモーダルが開く', async ({ page }) => {
    await page.goto('/')

    const firstInput = page.getByPlaceholder('1人目の出発駅')
    await firstInput.fill('渋谷')

    const firstOption = page.getByRole('option').first()
    await firstOption.waitFor({ state: 'visible' })
    await firstOption.click()

    const secondInput = page.getByPlaceholder('2人目の出発駅')
    await secondInput.fill('新宿')

    const secondOption = page.getByRole('option').first()
    await secondOption.waitFor({ state: 'visible' })
    await secondOption.click()

    const searchButton = page.getByRole('button', { name: '検索する' })
    await searchButton.click()

    await expect(page).toHaveURL(/\/result\?/)

    await expect(page.getByRole('region', { name: '検索結果の地図' })).toBeVisible()

    const restaurantCard = page.getByRole('article').first()
    await restaurantCard.waitFor({ state: 'visible' })
    await restaurantCard.click()

    await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

    const favoriteButton = page.getByRole('button', { name: /保存/ })
    await favoriteButton.click()

    const authModal = page.getByRole('dialog')
    await expect(authModal).toBeVisible()
    await expect(authModal).toContainText('ログイン')

    await expect(page.getByText('お気に入りの保存にはログインが必要です')).toBeVisible()
  })
})
