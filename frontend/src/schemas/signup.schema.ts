import z from 'zod'

export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '名前を入力してください'),
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
    password_confirmation: z
      .string()
      .min(1, '確認用のパスワードを入力してください'),
  })
  .superRefine(({ password, password_confirmation }, context) => {
    if (password_confirmation.length === 0)
      return

    if (password !== password_confirmation) {
      context.issues.push({
        code: 'custom',
        path: ['password_confirmation'],
        message: 'パスワードが一致しません',
        input: password_confirmation,
      })
    }
  })
