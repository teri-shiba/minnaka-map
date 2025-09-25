import type { ProviderId } from '~/types/auth-provider'
import z from 'zod'

export interface DeleteAccountFormValues {
  email?: string
}

export function deleteAccountSchema(provider: ProviderId, registeredEmail: string) {
  if (provider === 'email') {
    const lower = (registeredEmail ?? '').toLowerCase()
    return z.object({
      email: z
        .string({ required_error: 'メールアドレスは必須です' })
        .min(1, 'メールアドレスは必須です')
        .pipe(z.string().email('メールアドレスの形式が正しくありません'))
        .transform(value => value.toLowerCase())
        .refine(value => value === lower, 'メールアドレスが一致しません'),
    })
  }

  return z.object({
    email: z.string().optional(),
  })
}
