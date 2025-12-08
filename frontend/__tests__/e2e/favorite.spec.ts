import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { cleanupFavorites } from './helpers/favorites'
import { searchStations } from './helpers/search'

test.describe.configure({ mode: 'serial' })

test.describe('お気に入り機能フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('未認証', () => {
    test('ログイントーストが表示される', async ({ page }) => {
      await searchStations(page, ['渋谷', '新宿'])

      await page.waitForURL(/\/result\?/)

      const restaurantCard = page.getByRole('article').first()
      await expect(restaurantCard).toBeVisible()

      await restaurantCard.click()
      await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

      await page.getByRole('button', { name: /保存/ }).click()

      await expect(page.getByText('お気に入りの保存にはログインが必要です')).toBeVisible()
    })
  })

  test.describe('認証済み', () => {
    test.beforeEach(async ({ page }) => {
      await loginWithGoogle(page)
    })

    test.afterEach(async ({ page }) => {
      await cleanupFavorites(page)
    })

    test('詳細ページでお気に入り追加 → 削除できる', async ({ page }) => {
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

      await page.getByRole('button', { name: /保存/ }).click()

      await page.goto('/favorites')
      const favoriteCompactButton = restaurantCard.getByRole('button')
      await favoriteCompactButton.click()

      await expect(page.getByText('お気に入りから削除しました')).toBeVisible()
    })

    test('検索結果から複数のレストランを選択できる', async ({ page }) => {
      await test.step('渋谷・新宿で検索', async () => {
        await searchStations(page, ['渋谷', '新宿'])
        await page.waitForURL(/\/result\?/)
      })

      await test.step('1件目をお気に入りに追加', async () => {
        await page.getByRole('article').first().click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        await page.getByRole('button', { name: /保存/ }).click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('検索結果に戻る', async () => {
        await page.goBack()
        await page.waitForURL(/\/result\?/)
      })

      await test.step('2件目をお気に入りに追加', async () => {
        await page.getByRole('article').nth(1).click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        await page.getByRole('button', { name: /保存/ }).click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('お気に入り一覧で2件確認', async () => {
        await page.goto('/favorites')
        await expect(page.getByRole('article')).toHaveCount(2)
      })
    })

    test('駅の順番が違っても同じグループになる', async ({ page }) => {
      await test.step('渋谷・新宿で検索', async () => {
        await searchStations(page, ['渋谷', '新宿'])
        await page.waitForURL(/\/result\?/)
      })

      await test.step('1件目をお気に入りに追加', async () => {
        await page.getByRole('article').first().click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        await page.getByRole('button', { name: /保存/ }).click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('新宿・渋谷で検索', async () => {
        await page.goto('/')
        await searchStations(page, ['新宿', '渋谷'])
        await page.waitForURL(/\/result\?/)
      })

      await test.step('2件目をお気に入りに追加', async () => {
        await page.getByRole('article').nth(1).click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        await page.getByRole('button', { name: /保存/ }).click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('お気に入り一覧で1つのグループに2件確認', async () => {
        await page.goto('/favorites')
        await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1)
        await expect(page.getByRole('article')).toHaveCount(2)
      })
    })
  })
})
