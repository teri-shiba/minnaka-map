import { externalHref } from '~/utils/external-url'

describe('externalHref', () => {
  const origin = 'https://api.minnaka-map.com'

  it('baseOrigin が未設定のとき、エラーを投げる', () => {
    expect(() => externalHref(undefined, '/v1/resource')).toThrow('External API base URL is not set')
  })

  it('path が / で始まるとき、そのまま結合する', () => {
    const url = externalHref(origin, '/v1/resource')
    expect(url).toBe('https://api.minnaka-map.com/v1/resource')
  })

  it('path が / で始まらないとき、先頭に / を補う', () => {
    const url = externalHref(origin, 'v1/resource')
    expect(url).toBe('https://api.minnaka-map.com/v1/resource')
  })

  it('baseOrigin に余分なスラッシュがあっても正規化する', () => {
    const url = externalHref(`${origin}//`, '/v1/resource')
    expect(url).toBe('https://api.minnaka-map.com/v1/resource')
  })

  it('params を Record で渡したとき、クエリを付与する', () => {
    const url = new URL(externalHref(origin, '/v1', { q: 'query' }))
    expect(url.origin + url.pathname).toBe('https://api.minnaka-map.com/v1')
    expect(url.searchParams.get('q')).toBe('query')
  })

  it('params を URLSearchParams で渡したとき、クエリを付与する', () => {
    const sp = new URLSearchParams({ q: 'query' })
    const url = new URL(externalHref(origin, '/v1', sp))
    expect(url.origin + url.pathname).toBe('https://api.minnaka-map.com/v1')
    expect(url.searchParams.get('q')).toBe('query')
  })

  it('空の params を渡したとき、? は付かない', () => {
    const url = externalHref(`${origin}//`, 'v1/resource', {})
    expect(url).toBe('https://api.minnaka-map.com/v1/resource')
  })
})
