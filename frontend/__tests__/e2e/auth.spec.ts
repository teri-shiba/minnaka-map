import { expect, test } from '@playwright/test'
import { getVerificationLink } from './helpers/gmail-api'

test.describe.configure({ mode: 'serial' })

test.describe('認証フロー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('メール認証', () => {
    test('新規登録・ログインできる', async ({ page }) => {
      const timestamp = Date.now()
      const email = `${process.env.TEST_EMAIL!.replace('@', `+${timestamp}@`)}`

      await test.step('新規登録', async () => {
        await page.getByRole('button', { name: 'ログイン' }).click()

        await expect(page.getByRole('dialog')).toBeVisible()

        await page.getByText('新規登録').click()

        await page.getByLabel('ユーザー名').fill('テストユーザー')
        await page.getByLabel('メールアドレス').fill(email)
        await page.getByLabel('パスワード', { exact: true }).fill('Password123!')
        await page.getByLabel('パスワード（確認用）').fill('Password123!')

        const registerButton = page.getByRole('button', { name: '登録する' })
        await expect(registerButton).toBeEnabled()
        await registerButton.click()

        await expect(page.getByText('認証メールをご確認ください')).toBeVisible()
      })

      await test.step('メール認証', async () => {
        const confirmationLink = await getVerificationLink(email)
        await page.goto(confirmationLink)
        await expect(page.getByText('メールアドレスの確認が完了しました')).toBeVisible()
      })

      await test.step('ログイン', async () => {
        await page.goto('/')
        await page.getByRole('button', { name: 'ログイン' }).click()

        await page.getByLabel('メールアドレス').fill(email)
        await page.getByLabel('パスワード', { exact: true }).fill('Password123!')

        await page.getByRole('button', { name: 'ログイン' }).click()

        await expect(page.getByText('ログインに成功しました')).toBeVisible()
        await expect(page.getByRole('button', { name: 'ユーザーメニュー' })).toBeVisible()
      })
    })
  })

  test.describe('SNS認証', () => {
    test('Googleアカウントでログインできる', async ({ page }) => {
      await page.getByRole('button', { name: 'ログイン' }).click()

      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByRole('link', { name: /Googleでログイン/ }).click()

      await expect(page.getByText('ログインに成功しました')).toBeVisible()
      await expect(page.getByRole('button', { name: 'ユーザーメニュー' })).toBeVisible()
    })

    test('LINEアカウントでログインできる', async ({ page }) => {
      await page.getByRole('button', { name: 'ログイン' }).click()

      await expect(page.getByRole('dialog')).toBeVisible()

      await page.getByRole('link', { name: /LINEでログイン/ }).click()

      await expect(page.getByText('ログインに成功しました')).toBeVisible()
      await expect(page.getByRole('button', { name: 'ユーザーメニュー' })).toBeVisible()
    })
  })

  test('ログアウト後、未認証状態になる', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'ログイン' })
    await loginButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('link', { name: /Googleでログイン/ }).click()

    const userMenu = page.getByRole('button', { name: 'ユーザーメニュー' })
    await expect(userMenu).toBeVisible()

    await userMenu.click()

    await page.getByRole('menuitem', { name: 'ログアウト' }).click()

    await expect(page.getByText('ログアウトしました')).toBeVisible()
    await expect(page).toHaveURL('/')
    await expect(userMenu).not.toBeVisible()
    await expect(loginButton).toBeVisible()
  })

  test('アカウント削除後、未認証状態になる', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: 'ログイン' })
    await loginButton.click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('link', { name: /Googleでログイン/ }).click()

    const userMenu = page.getByRole('button', { name: 'ユーザーメニュー' })
    await expect(userMenu).toBeVisible()

    await userMenu.click()

    await page.getByRole('menuitem', { name: 'アカウント設定' }).click()

    await expect(page).toHaveURL(/\/settings/)

    await page.getByRole('button', { name: '削除する' }).click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByPlaceholder('メールアドレスを入力').fill('e2e@test.com')

    await page.getByRole('dialog').getByRole('button', { name: '削除する' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('アカウントが削除されました')).toBeVisible()
    await expect(loginButton).toBeVisible()
  })
})
