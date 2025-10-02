/**
 * TODO: google_oauth2 もメール確認を必須にする。
 * 次の DeleteAccountForm のテスト工程で、UI表示と resolver の provider を
 * ['email','google_oauth2'] 両対応に変更し、スキーマ・UI・テストを同一コミットで更新する。
 */

import type { ZodError } from 'zod'
import { deleteAccountSchema } from '~/schemas/delete-account.schema'

type ParseResult<T = unknown>
  = | { success: true, data: T }
    | { success: false, error: ZodError<unknown> }

function messageOf<T>(result: ParseResult<T>): string[] {
  return result.success ? [] : result.error.issues.map(i => i.message)
}

describe('deleteAccountSchema', () => {
  describe('provider = email', () => {
    const provider = 'email' as const
    const registered = 'test@minnaka-map.com'

    it('メール未入力（プロパティ欠落）は「必須」で失敗する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({})
      expect(result.success).toBe(false)
      expect(messageOf(result)).toEqual(['メールアドレスは必須です'])
    })

    it('空文字は「必須」で失敗する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({ email: '' })
      expect(result.success).toBe(false)
      expect(messageOf(result)).toEqual(['メールアドレスは必須です'])
    })

    it('不正な形式は専用メッセージでで失敗する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({ email: 'not-an-email ' })
      expect(result.success).toBe(false)
      expect(messageOf(result)).toEqual(['メールアドレスの形式が正しくありません'])
    })

    it('形式は正しいが登録メールと不一致なら失敗する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({ email: 'other@minnaka-map.com' })
      expect(result.success).toBe(false)
      expect(messageOf(result)).toEqual(['メールアドレスが一致しません'])
    })

    it('大文字小文字が異なると不一致で失敗する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({ email: 'TEST@MINNAKA-MAP.COM' })
      expect(result.success).toBe(false)
      expect(messageOf(result)).toEqual(['メールアドレスが一致しません'])
    })

    it('完全一致なら成功する', () => {
      const schema = deleteAccountSchema(provider, registered)
      const result = schema.safeParse({ email: 'test@minnaka-map.com' })
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data.email).toBe('test@minnaka-map.com')
    })
  })

  describe.each(['google_oauth2', 'line'] as const)('provider = %s', (provider) => {
    it('email が無くても成功する（オプショナル）', () => {
      const schema = deleteAccountSchema(provider, 'ignored@minnaka-map.com')
      const result = schema.safeParse({})
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data.email).toBeUndefined()
    })

    it('email があっても任意文字列として成功する（transform / 検証なし）', () => {
      const schema = deleteAccountSchema(provider, 'ignored@minnaka-map.com')
      const result = schema.safeParse({ email: 'TEST@MINNAKA-MAP.COM' })
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data.email).toBe('TEST@MINNAKA-MAP.COM')
    })
  })
})
