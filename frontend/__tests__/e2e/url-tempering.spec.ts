import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { searchStations } from './helpers/search'

test.describe('URL改ざん検出', () => {
  test('検索結果がいの店舗IDへの改ざんを検出し、保存を拒否する', async ({ page }) => {
    await page.goto('/')
    await loginWithGoogle(page)

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

    const errorToast = page.getByText('この店舗は保存できません。検索結果から選択してください。')
    await expect(errorToast).toBeVisible()

    await expect(favoriteButton).toHaveText('保存する')
  })
})
