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

export function deleteAccountSchema(
  provider: ProviderId,
  registeredEmail: string,
) {
  if (provider === 'email') {
    const registered = (registeredEmail ?? '').trim()

    const basic = z.string().trim().min(1, 'メールアドレスは必須です')
    const format = z.email('メールアドレスの形式が正しくありません')
    const normalize = z.any().transform((value: unknown) => (value == null ? '' : String(value)))
    const emailSchema = normalize.pipe(basic.pipe(format))

    return z.object({ email: emailSchema }).superRefine(({ email }, context) => {
      if (!format.safeParse(email).success)
        return

      if (email !== registered) {
        context.issues.push({
          code: 'custom',
          path: ['email'],
          message: 'メールアドレスが一致しません',
          input: email,
        })
      }
    })
  }

  return z.object({ email: z.string().optional() })
}
