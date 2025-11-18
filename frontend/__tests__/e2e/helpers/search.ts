import type { Page } from '@playwright/test'

/**
 * 駅名で検索を実行する
 * @param page - Playwrightのページオブジェクト
 * @param stationNames - 駅名の配列(2-6個)
 */
export async function searchStations(page: Page, stationNames: string[]) {
  await page.goto('/')

  if (stationNames.length < 2 || stationNames.length > 6)
    throw new Error('駅名は2個以上6個以下で指定してください')

  for (let i = 0; i < stationNames.length; i++) {
    const placeholder = `${i + 1}人目の出発駅`
    const input = page.getByPlaceholder(placeholder)
    await input.fill(stationNames[i])

    // オプションが表示されるまで待機
    await page.getByRole('option').first().waitFor({ state: 'visible' })

    // 過去の検索から選択を試みる
    try {
      const recentOption = page
        .getByRole('group', { name: '過去に検索した場所' })
        .getByRole('option')
        .filter({ hasText: stationNames[i] })
        .first()

      await recentOption.click({ timeout: 1000 })
    }
    catch {
      // 履歴から選択できなかった場合は駅候補から選択
      const candidateOption = page
        .getByRole('group', { name: '駅候補' })
        .getByRole('option')
        .filter({ hasText: stationNames[i] })
        .first()

      await candidateOption.click()
    }
  }

  const searchButton = page.getByRole('button', { name: '検索する' })
  await searchButton.click()
}

/**
 * 検索結果ページの表示を待機する
 */
export async function waitForSearchResults(page: Page) {
  await page.waitForURL(/\/result\?/)
  await page.getByRole('region', { name: '検索結果の地図' }).waitFor({ state: 'visible' })

  await page.waitForTimeout(1000)
}

/**
 * 最初のレストランカードをクリックして詳細ページへ遷移
 */
export async function clickFirstRestaurant(page: Page) {
  const restaurantCard = page.getByRole('article').first()
  await restaurantCard.waitFor({ state: 'visible' })
  await restaurantCard.click()
  await page.waitForURL(/\/restaurant\/[^/]+/)
}

/**
 * お気に入りボタンをクリック
 */
export async function clickFavoriteButton(page: Page) {
  const favoriteButton = page.getByRole('button', { name: /保存/ })
  await favoriteButton.click()
}
