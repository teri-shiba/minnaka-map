import z from 'zod'

export interface DeleteAccountFormValues {
  email?: string
}

export function deleteAccountSchema(
  requiresEmailCheck: boolean,
  registeredEmail: string,
) {
  if (requiresEmailCheck) {
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
