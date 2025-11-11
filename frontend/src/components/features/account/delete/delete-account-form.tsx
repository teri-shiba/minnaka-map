'use client'

import type { ComponentProps } from 'react'
import type { DeleteAccountFormValues } from '~/schemas/delete-account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtomValue } from 'jotai'
import { useForm } from 'react-hook-form'
import { Button } from '~/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { useAuth } from '~/hooks/useAuth'
import { deleteAccountSchema } from '~/schemas/delete-account.schema'
import { userStateAtom } from '~/state/user-state.atom'

interface DeleteAccountFormProps extends ComponentProps<'form'> {
  onClose?: () => void
}

export default function DeleteAccountForm({ onClose }: DeleteAccountFormProps) {
  const user = useAtomValue(userStateAtom)
  const { deleteAccount } = useAuth()

  const requiresEmailCheck = !!user.email

  const form = useForm<DeleteAccountFormValues>({
    resolver: zodResolver(
      deleteAccountSchema(!!user.email, user.email || ''),
    ),
    defaultValues: { email: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async () => {
    const result = await deleteAccount()
    if (result.success)
      onClose?.()
  }

  const handleCancel = () => onClose?.()

  const getEmailHint = (email: string) => {
    if (!email)
      return ''

    const [localPart, domain] = email.split('@')

    if (!domain)
      return

    if (localPart.length <= 3)
      return `${localPart}***@${domain}`

    return `${localPart.slice(0, 3)}***@${domain}`
  }

  const disabledByAuth = !user.isSignedIn || !user.provider

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {requiresEmailCheck && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-normal text-gray-500">
                    ヒント:
                    {' '}
                    {getEmailHint(user.email)}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      id="email"
                      placeholder="登録中のメールアドレスを入力"
                      className="mb-6 mt-2 h-auto py-3 focus-visible:ring-1 focus-visible:ring-gray-600"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            >
            </FormField>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-auto border border-destructive bg-white py-3 text-destructive hover:bg-white hover:text-destructive"
              onClick={handleCancel}
              disabled={isSubmitting || disabledByAuth}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="destructive"
              className="h-auto py-3"
              disabled={isSubmitting || disabledByAuth || (requiresEmailCheck && !form.watch('email'))}
            >
              {isSubmitting ? '処理中...' : '削除する'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
