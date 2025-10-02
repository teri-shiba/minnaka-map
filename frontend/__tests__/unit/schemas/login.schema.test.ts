import type { ZodError } from 'zod'
import { loginSchema } from '~/schemas/login.schema'

type ParseResult<T = unknown>
  = | { success: true, data: T }
    | { success: false, error: ZodError<unknown> }

function messagesOf<T>(result: ParseResult<T>): string[] {
  return result.success ? [] : result.error.issues.map(i => i.message)
}

const VALID_EMAIL = 'test@minnaka-map.com'
const VALID_PASSWORD = 'Abcdef1@'

function parse(overrides: Partial<{ email: string, password: string }> = {}) {
  return loginSchema.safeParse({
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
    ...overrides,
  })
}

describe('loginSchema', () => {
  describe('email のバリデーション', () => {
    it('不正なメール形式なら専用メッセージで失敗する', () => {
      const result = parse({ email: 'not-an-email' })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['メールアドレスの形式が正しくありません'])
    })

    it('email の前後空白は trim され成功する', () => {
      const result = parse({ email: ' test@minnaka-map.com ' })
      expect(result.success).toBe(true)
      if (result.success)
        expect(result.data.email).toBe('test@minnaka-map.com')
    })
  })

  describe('password のバリデーション', () => {
    it.each([
      [
        '8文字以上でないと失敗する',
        'Abc1@',
        'パスワードは8文字以上で入力してください',
      ],
      [
        '数字を1文字以上含まないと失敗する',
        'Abcdefg@',
        '数字を1文字以上使用してください',
      ],
      [
        '英小文字を1文字以上含まないと失敗する',
        'ABCDEF1@',
        '英小文字を1文字以上使用してください',
      ],
      [
        '英大文字を1文字以上含まないと失敗する',
        'abcdef1@',
        '英大文字を1文字以上使用してください',
      ],
      [
        '記号 (定義済みクラスのいずれか) を1文字以上含まないと失敗する',
        'Abcdefg1',
        '記号を1文字以上使用してください',
      ],
    ])('%s', (_label, password, expectedMessage) => {
      const result = parse({ password })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toContain(expectedMessage)
    })

    it('複数条件を同時に満たさない場合、該当メッセージが複数返る', () => {
      const result = parse({ password: 'short' })
      expect(result.success).toBe(false)

      const messages = messagesOf(result)
      expect(messages).toEqual([
        'パスワードは8文字以上で入力してください',
        '数字を1文字以上使用してください',
        '英大文字を1文字以上使用してください',
        '記号を1文字以上使用してください',
      ])
      expect(messages).toHaveLength(4)
    })

    it('パスワードがちょうど8文字でも全要件を満たせば成功する', () => {
      const result = parse({ password: 'Abc1@def' })
      expect(result.success).toBe(true)
    })
  })

  it('全要件を満たすと成功する', () => {
    const result = parse({ password: VALID_PASSWORD })
    expect(result.success).toBe(true)
  })
})
