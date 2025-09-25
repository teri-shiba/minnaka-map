import type { ProviderId } from '~/types/auth-provider'
import z from 'zod'

export interface DeleteAccountFormValues {
  email?: string
}

export function deleteAccountSchema(provider: ProviderId, registeredEmail: string) {
  if (provider === 'email') {
    const registered = (registeredEmail ?? '').trim()

    const base = z
      .string({ required_error: 'メールアドレスは必須です' })
      .trim()
      .min(1, 'メールアドレスは必須です')

    const format = z
      .string()
      .email('メールアドレスの形式が正しくありません')

    const schema = z.object({
      email: base.pipe(format),
    })

    return schema.superRefine(({ email }, context) => {
      const isValidFormat = format.safeParse(email).success
      if (!isValidFormat)
        return

      if (email !== registered) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['email'],
          message: 'メールアドレスが一致しません',
        })
      }
    })
  }

  return z.object({
    email: z.string().optional(),
  })
}
