'use client'
import type { AxiosError, AxiosResponse } from 'axios'
import type { FieldValues, SubmitHandler } from 'react-hook-form'

import axios from 'axios'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '../buttons/Button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form'
import { Input } from './Input'

export default function SignUpForm() {
  const router = useRouter()

  const form = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })
  // 登録用に変える必要あり
  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/sign_in`
    const headers = { 'Content-Type': 'application/json' }

    axios.post(url, data, { headers })
      .then((res: AxiosResponse) => {
        localStorage.setItem('access-token', res.headers['access-token'])
        localStorage.setItem('client', res.headers.client)
        localStorage.setItem('uid', res.headers.uid)
        router.push('/')
        toast.success('認証メールを送信しました')
      })
      .catch((e: AxiosError<{ error: string }>) => {
        console.error(e.message)
        toast.error('登録に失敗しました')
      })
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold">パスワード（確認用）</FormLabel>
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
        <Button type="submit" className="h-auto py-3">登録する</Button>
      </form>
    </Form>
  )
}
