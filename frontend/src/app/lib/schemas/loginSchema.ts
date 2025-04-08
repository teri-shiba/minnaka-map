import { z } from 'zod'

export const loginSchema = z.object({
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
})
