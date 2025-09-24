import { z } from 'zod'

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, { message: '名前を入力してください' }),
    email: z
      .string()
      .email(
        { message: 'メールアドレスの形式が正しくありません' },
      ),
    password: z
      .string()
      .min(8, { message: 'パスワードは8文字以上で入力してください' })
      .regex(/\d+/, { message: '数字を1文字以上使用してください' })
      .regex(/[a-z]+/, { message: '英小文字を1文字以上使用してください' })
      .regex(/[A-Z]+/, { message: '英大文字を1文字以上使用してください' })
      .regex(/[+*'"`#$%&\-^\\@;:,./=~|[\](){}<>]+/, { message: '記号を1文字以上使用してください' }),
    password_confirmation: z
      .string()
      .min(1, { message: '確認用のパスワードを入力してください' }),
  })
  .superRefine(({ password, password_confirmation }, ctx) => {
    if (password !== password_confirmation) {
      ctx.addIssue({
        path: ['password_confirmation'],
        code: z.ZodIssueCode.custom,
        message: 'パスワードが一致しません',
      })
    }
  })
