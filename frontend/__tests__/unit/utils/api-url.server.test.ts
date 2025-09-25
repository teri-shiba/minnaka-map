/* @jest-environment node */

import type { QueryParams } from '~/utils/api-url'
import { apiBaseHref, apiHref, apiUrl } from '~/utils/api-url'

describe('apiUrl(server)', () => {
  const SERVER_ORIGIN = 'https://server.minnaka-map.com'

  afterEach(() => {
    delete process.env.API_BASE_URL
    delete process.env.NEXT_PUBLIC_API_BASE_URL
  })

  it('base が未設定ならエラーを投げる', () => {
    expect(() => apiUrl('/users')).toThrow('API base URL is not set')
  })

  it('スラッシュを補い、クエリを付与できる', () => {
    process.env.API_BASE_URL = SERVER_ORIGIN

    const params: QueryParams = {
      q: '',
      page: 0,
      active: false,
      ids: ['a', 'b', 'c'],
      nothing: null,
      skip: undefined,
    }

    const url = apiUrl('users', params)

    expect(url.origin + url.pathname).toBe(`${SERVER_ORIGIN}/api/v1/users`)
    expect(url.searchParams.get('q')).toBe('')
    expect(url.searchParams.get('page')).toBe('0')
    expect(url.searchParams.get('active')).toBe('false')
    expect(url.searchParams.getAll('ids')).toEqual(['a', 'b', 'c'])
    expect(url.searchParams.has('nothing')).toBe(false)
    expect(url.searchParams.has('skip')).toBe(false)
  })

  it('空の params / 空配列はクエリに含めない', () => {
    process.env.API_BASE_URL = SERVER_ORIGIN
    expect(apiUrl('users', {}).search).toBe('')
    expect(apiUrl('users', { ids: [] }).searchParams.has('ids')).toBe(false)
  })

  it('apiHref は apiUrl の文字列版 (href) を返す', () => {
    process.env.API_BASE_URL = SERVER_ORIGIN
    expect(apiHref('/posts', { tag: 'news' })).toBe(`${SERVER_ORIGIN}/api/v1/posts?tag=news`)
  })

  it('apiBaseHref は /api/v1 を含むベース URL(末尾スラッシュなし) を返す', () => {
    process.env.API_BASE_URL = SERVER_ORIGIN
    expect(apiBaseHref()).toBe(`${SERVER_ORIGIN}/api/v1`)
  })
})
