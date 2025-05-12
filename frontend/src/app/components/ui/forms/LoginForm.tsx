'use client'
import type { FieldValues, SubmitHandler } from 'react-hook-form'

import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useAuth } from '~/app/hooks/useAuth'
import { loginSchema } from '~/app/lib/schemas/loginSchema'
import { Button } from '../buttons/Button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form'
import { Input } from './Input'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // TODO: RSCのfetchを使えないか検討する
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      await login({ email: data.email, password: data.password })
      if (onSuccess)
        onSuccess()
    }
    catch (error) {
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid items-start gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">メールアドレス</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">パスワード</FormLabel>
              <FormDescription>
                英数字と記号を含む8文字以上
              </FormDescription>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="h-auto py-3">ログイン</Button>
      </form>
    </Form>
  )
}
