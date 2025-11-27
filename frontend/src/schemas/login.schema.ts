import z from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.email('メールアドレスの形式が正しくありません')),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .regex(/\d+/, '数字を1文字以上使用してください')
    .regex(/[a-z]+/, '英小文字を1文字以上使用してください')
    .regex(/[A-Z]+/, '英大文字を1文字以上使用してください')
    .regex(/[!"#$%&'()*+,\-/:;<=>?@[\\\]^_`{|}~]+/, '記号を1文字以上使用してください'),
})
