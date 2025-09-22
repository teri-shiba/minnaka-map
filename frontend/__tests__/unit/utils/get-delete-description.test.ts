import { getDeleteDescription } from '~/utils/get-delete-description'

describe('getDeleteDescription', () => {
  it('provider が email のとき、メールの文言を返す', () => {
    const email = 'email' as const
    expect(getDeleteDescription(email)).toBe('メールアドレスでログイン中です。')
  })

  it('provider が google_oauth2 のとき、Google の文言を返す', () => {
    const google_oauth2 = 'google_oauth2' as const
    expect(getDeleteDescription(google_oauth2)).toBe('Googleアカウントでログイン中です。')
  })

  it('provider が line のとき、LINE の文言を返す', () => {
    const line = 'line' as const
    expect(getDeleteDescription(line)).toBe('LINEアカウントでログイン中です。')
  })

  it('provider が null のとき、空文字を返す', () => {
    expect(getDeleteDescription(null)).toBe('')
  })
})
