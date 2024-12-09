'use client'
import type { FieldValues, SubmitHandler } from 'react-hook-form'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { useAuth } from '~/app/hooks/useAuth'
import { Button } from '../buttons/Button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form'
import { Input } from './Input'

export default function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    login(data, router)
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
