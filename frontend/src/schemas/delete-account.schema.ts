import type { ProviderId } from '~/types/auth-provider'
import z from 'zod'

export interface DeleteAccountFormValues {
  email?: string
}

export function deleteAccountSchema(provider: ProviderId, registeredEmail: string) {
  // TODO: gmail もメール一致判定を組み込む
  if (provider === 'email') {
    const registered = (registeredEmail ?? '').trim()
    return z.object({
      email: z
        .string({ required_error: 'メールアドレスは必須です' })
        .min(1, 'メールアドレスは必須です')
        .pipe(z.string().email('メールアドレスの形式が正しくありません'))
        .refine(value => value === registered, 'メールアドレスが一致しません'),
    })
  }

  return z.object({
    email: z.string().optional(),
  })
}
