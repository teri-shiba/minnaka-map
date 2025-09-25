/**
 * TODO: google_oauth2 も requiresEmailCheck に含める（DBにメールがある前提）。
 * - email, google_oauth2: 必須/形式/DB値との厳密一致を適用
 * - line: email 未保有の可能性があるためオプショナルのまま
 * 変更はフォーム/UIと同一コミットで実施すること。
 */

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
