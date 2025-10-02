import type { ZodError } from 'zod'
import { signupSchema } from '~/schemas/signup.schema'

type SignupInput = import('zod').infer<typeof signupSchema>
type ParseResult<T = unknown>
  = | { success: true, data: T }
    | { success: false, error: ZodError<unknown> }

function messagesOf<T>(result: ParseResult<T>): string[] {
  return result.success ? [] : result.error.issues.map(i => i.message)
}

function findIssue(result: ParseResult<SignupInput>, message: string) {
  return result.success ? undefined : result.error.issues.find(i => i.message === message)
}

const VALID: SignupInput = {
  name: 'Taro',
  email: 'test@minnaka-map.com',
  password: 'Abcdef1@',
  password_confirmation: 'Abcdef1@',
}

function parse(overrides: Partial<typeof VALID> = {}) {
  return signupSchema.safeParse({
    ...VALID,
    ...overrides,
  })
}

describe('signupSchema', () => {
  describe('name', () => {
    it('空文字は失敗し、メッセージが返る', () => {
      const result = parse({ name: '' })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['名前を入力してください'])
    })

    it('空白のみも失敗し、メッセージが返る', () => {
      const result = parse({ name: '     ' })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['名前を入力してください'])
    })

    it('前後空白は trim され、成功する', () => {
      const result = parse({ name: '  Taro  ' })
      expect(result.success).toBe(true)

      if (result.success)
        expect(result.data.name).toBe('Taro')
    })
  })

  describe('email', () => {
    it('正しい形式なら成功する', () => {
      const result = parse()
      expect(result.success).toBe(true)
    })

    it('不正な形式なら専用メッセージで失敗する', () => {
      const result = parse({ email: 'non-an-email' })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['メールアドレスの形式が正しくありません'])
    })

    it('email の前後空白は trim され成功する', () => {
      const result = parse({ email: '  test@minnaka-map.com  ' })
      expect(result.success).toBe(true)
      if (result.success)
        expect(result.data.email).toBe('test@minnaka-map.com')
    })
  })

  describe('password', () => {
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
      const result = parse({
        password: 'short',
        password_confirmation: 'short',
      })
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
  })

  describe('password_confirmation', () => {
    it('空なら「確認用のパスワードを入力してください」が含まれる', () => {
      const result = parse({ password_confirmation: '' })
      expect(result.success).toBe(false)
      expect(messagesOf(result)).toEqual(['確認用のパスワードを入力してください'])
    })

    it('password と不一致なら「パスワードが一致しません」が返る', () => {
      const result = parse({ password_confirmation: 'Different1!' })
      expect(result.success).toBe(false)
      const issue = findIssue(result, 'パスワードが一致しません')
      expect(issue).toBeDefined()
      expect(issue?.path).toEqual(['password_confirmation'])
    })

    it('一致していれば成功する', () => {
      const result = parse({ password_confirmation: VALID.password_confirmation })
      expect(result.success).toBe(true)
    })

    it('パスワードがちょうど8文字でも全要件を満たせば成功する', () => {
      const result = parse({
        password: 'Abc1@def',
        password_confirmation: 'Abc1@def',
      })
      expect(result.success).toBe(true)
    })
  })

  it('全要件を満たすと成功する', () => {
    const result = parse()
    expect(result.success).toBe(true)
  })
})
