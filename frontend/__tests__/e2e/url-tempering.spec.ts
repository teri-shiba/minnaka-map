import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { cleanupFavorites } from './helpers/favorites'
import { searchStations } from './helpers/search'

test.describe.configure({ mode: 'serial' })

test.describe('URL改ざん検出', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await loginWithGoogle(page)
  })

  test.afterEach(async ({ page }) => {
    await cleanupFavorites(page)
  })

  test('検索結果外の店舗IDへの改ざんを検出し、保存を拒否する', async ({ page }) => {
    await searchStations(page, ['渋谷', '新宿'])
    await page.waitForURL(/\/result\?/)

    const restaurantCard = page.getByRole('article').first()
    await expect(restaurantCard).toBeVisible()

    await restaurantCard.click()
    await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

    const legitimateURL = page.url()
    const urlObj = new URL(legitimateURL)
    const token = urlObj.searchParams.get('t')

    expect(token).toBeTruthy()

    const temperedURL = legitimateURL.replace(/\/restaurant\/[^?]+/, '/restaurant/J001117579')
    await page.goto(temperedURL)

    const favoriteButton = page.getByRole('button', { name: '保存する' })
    await favoriteButton.click()

    const errorToast = page.getByText(/この店舗は保存できません/)
    await expect(errorToast).toBeVisible()

    await expect(favoriteButton).toHaveText('保存する')
  })

  test('お気に入り一覧からの遷移時のURL改ざんを検出する', async ({ page }) => {
    await searchStations(page, ['渋谷', '新宿'])
    await page.waitForURL(/\/result\?/)

    const restaurantCard = page.getByRole('article').first()
    await expect(restaurantCard).toBeVisible()

    await restaurantCard.click()
    await expect(page).toHaveURL(/\/restaurant\/[^/]+/)

    const saveButton = page.getByRole('button', { name: '保存する' })
    await saveButton.click()
    await page.getByText('お気に入りに追加しました').waitFor()

    await page.goto('/favorites')

    const favoriteCard = page.getByRole('article').first()
    await favoriteCard.click()
    await page.waitForURL(/\/restaurant\/[^/]+/)

    const legitimateURL = page.url()
    const urlObj = new URL(legitimateURL)
    const historyId = urlObj.searchParams.get('historyId')
    expect(historyId).toBeTruthy()

    const tamperedURL = legitimateURL.replace(/\/restaurant\/[^/?]+/, '/restaurant/J001117579')
    await page.goto(tamperedURL)

    await page.getByRole('button', { name: '保存する' }).click()

    const errorToast = page.getByText(/この店舗は保存できません/)
    await expect(errorToast).toBeVisible()
  })
})
