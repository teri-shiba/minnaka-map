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

    test('検索結果から複数のレストランを選択できる', async ({ page }) => {
      await test.step('渋谷・新宿で検索', async () => {
        await searchStations(page, ['渋谷', '新宿'])
        await page.waitForURL(/\/result\?/)
      })

      await test.step('レストランAをお気に入り', async () => {
        await page.getByRole('article').first().click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        const favoriteButton = page.getByRole('button', { name: /保存/ })
        await favoriteButton.click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('検索結果に戻る', async () => {
        await page.goBack()
        await page.waitForURL(/\/result\?/)
      })

      await test.step('レストランBをお気に入り', async () => {
        await page.getByRole('article').nth(1).click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        const favoriteButton = page.getByRole('button', { name: /保存/ })
        await favoriteButton.click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('お気に入り一覧で2件確認', async () => {
        await page.goto('/favorites')
        await expect(page.getByRole('article')).toHaveCount(2)
      })

      await test.step('クリーンアップ', async () => {
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

    test('駅の順番が違っても同じグループになる', async ({ page }) => {
      await test.step('1回目: 渋谷・新宿で検索してレストランAをお気に入り', async () => {
        await searchStations(page, ['渋谷', '新宿'])
        await page.waitForURL(/\/result\?/)

        await page.getByRole('article').first().click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        const favoriteButton = page.getByRole('button', { name: /保存/ })
        await favoriteButton.click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('2回目: 新宿・渋谷で検索してレストランBをお気に入り', async () => {
        await page.goto('/')
        await searchStations(page, ['新宿', '渋谷'])
        await page.waitForURL(/\/result\?/)

        await page.getByRole('article').nth(1).click()
        await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

        const favoriteButton = page.getByRole('button', { name: /保存/ })
        await favoriteButton.click()
        await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
        await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
      })

      await test.step('グルーピング確認: 1つのグループに2件', async () => {
        await page.goto('/favorites')
        await expect(page.getByRole('heading', { level: 2 })).toHaveCount(1)
        await expect(page.getByRole('article')).toHaveCount(2)
      })

      await test.step('クリーンアップ', async () => {
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
})
