import { expect, test } from '@playwright/test'
import { loginWithGoogle } from './helpers/auth'
import { cleanupFavorites } from './helpers/favorites'
import { searchStations } from './helpers/search'

test.describe('リストシェア機能フロー', () => {
  test.afterEach(async ({ page }) => {
    await cleanupFavorites(page)
  })

  test.skip('存在しないシェアURLにアクセスしたとき、404ページが表示される', async ({ page }) => {
    const invalidUuid = 'INVALID_UUID'
    await page.goto(`/shared/${invalidUuid}`)

    await expect(page.getByRole('heading', { name: /Not Found/ })).toBeVisible()
  })

  test('認証済みユーザーがお気に入りリストをシェアし、未認証状態で閲覧できる', async ({ page, context }) => {
    await page.goto('/')
    await loginWithGoogle(page)

    await test.step('お気に入りを2件登録する', async () => {
      await searchStations(page, ['渋谷', '新宿'])
      await page.waitForURL(/\/result\?/)

      const restaurantCardFirst = page.getByRole('article').first()
      await expect(restaurantCardFirst).toBeVisible()
      await restaurantCardFirst.click()

      const saveButton = page.getByRole('button', { name: /保存/ })
      await expect(saveButton).toBeEnabled()
      await saveButton.click()

      await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
      await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()

      await page.goBack()

      const restaurantCardSecond = page.getByRole('article').nth(1)
      await expect(restaurantCardSecond).toBeVisible()
      await restaurantCardSecond.click()

      const saveButtonSecond = page.getByRole('button', { name: /保存/ })
      await expect(saveButtonSecond).toBeEnabled()
      await saveButtonSecond.click()

      await page.getByText('お気に入りに追加しました').waitFor({ state: 'visible' })
      await expect(page.getByRole('button', { name: /保存済み/ })).toBeVisible()
    })

    const clipboardText = await test.step('シェアリンクを生成してコピーする', async () => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])

      await page.goto('/favorites')

      const shareButton = page.getByRole('button', { name: /このリストをシェアする/ }).first()
      await shareButton.click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      const copyLinkButton = dialog.getByRole('button', { name: /リンクをコピーする/ })
      await copyLinkButton.click()

      await page.getByText('リンクをコピーしました').waitFor({ state: 'visible' })

      const text = await page.evaluate(() => navigator.clipboard.readText())
      expect(text).toContain('/shared/')

      return text
    })

    await test.step('未認証状態でシェアリストを閲覧する', async () => {
      const incognitoContext = await context.browser()!.newContext()
      const incognitoPage = await incognitoContext.newPage()

      await incognitoPage.goto(clipboardText)

      await expect(incognitoPage.getByRole('heading', { level: 1, name: /渋谷/ })).toBeVisible()
      await expect(incognitoPage.getByRole('heading', { level: 1, name: /新宿/ })).toBeVisible()

      const restaurantCards = incognitoPage.getByRole('article')
      await expect(restaurantCards).toHaveCount(2)

      await incognitoContext.close()
    })
  })
})
