import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { searchStations } from './helpers/search'

test.describe.configure({ mode: 'serial' })

test.describe('お気に入り機能フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('未認証', () => {
    test('ログインモーダルが表示される', async ({ page }) => {
      await searchStations(page, ['渋谷', '新宿'])

      await page.waitForURL(/\/result\?/)

      const restaurantCard = page.getByRole('article').first()
      await expect(restaurantCard).toBeVisible()

      await restaurantCard.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      await page.getByRole('button', { name: /保存/ }).click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByText('お気に入りの保存にはログインが必要です')).toBeVisible()
    })
  })

  test.describe('認証済み', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithGoogle(page)
    })

    test('詳細ページでお気に入り追加→削除できる', async ({ page }) => {
      await searchStations(page, ['渋谷', '新宿'])

      await page.waitForURL(/\/result\?/)

      const restaurantCard = page.getByRole('article').first()
      await expect(restaurantCard).toBeVisible()

      await restaurantCard.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      const favoriteButton = page.getByRole('button', { name: /保存/ })
      await favoriteButton.click()

      await expect(page.getByText('お気に入りに追加しました')).toBeVisible()
      await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()

      await favoriteButton.click()
      await expect(page.getByText('お気に入りから削除しました')).toBeVisible()
      await expect(page.getByRole('button', { name: /保存/ })).toBeVisible()
    })

    test('一覧からお気に入りを削除できる', async ({ page }) => {
      await searchStations(page, ['渋谷', '新宿'])

      await page.waitForURL(/\/result\?/)

      const restaurantCard = page.getByRole('article').first()
      await expect(restaurantCard).toBeVisible()

      await restaurantCard.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      const favoriteButton = page.getByRole('button', { name: /保存/ })
      await favoriteButton.click()

      await page.goto('/favorites')
      const favoriteCompactButton = restaurantCard.getByRole('button')
      await favoriteCompactButton.click()

      await expect(page.getByText('お気に入りから削除しました')).toBeVisible()
    })

    test('グルーピング機能が動作する', async ({ page }) => {
      await searchStations(page, ['渋谷', '新宿'])
      await page.waitForURL(/\/result\?/)

      const restaurantCardFirst = page.getByRole('article').first()
      await expect(restaurantCardFirst).toBeVisible()

      await restaurantCardFirst.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      const favoriteButton = page.getByRole('button', { name: /保存/ })
      await favoriteButton.click()

      await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
      await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()

      await page.goto('/')

      await searchStations(page, ['渋谷', '新宿'])
      await page.waitForURL(/\/result\?/)

      const restaurantCardSecond = page.getByRole('article').nth(1)
      await expect(restaurantCardSecond).toBeVisible()

      await restaurantCardSecond.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      await favoriteButton.click()

      await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
      await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()

      await page.goto('/favorites')
      await expect(page.getByRole('heading', { level: 2, name: /渋谷/ })).toBeVisible()
      await expect(page.getByRole('heading', { level: 2, name: /新宿/ })).toBeVisible()
      await expect(page.getByRole('article')).toHaveCount(2)

      // クリーンアップ
      await page.getByRole('article').first().getByRole('button').click()
      await page.getByText('お気に入りから削除しました').waitFor({ state: 'visible' })

      await page.reload()

      const remaining = await page.getByRole('article').count()
      if (remaining > 0) {
        await page.getByRole('article').first().getByRole('button').click()
        await page.getByText('お気に入りから削除しました').waitFor({ state: 'visible' })
        await page.reload()
      }
    })
  })
})
