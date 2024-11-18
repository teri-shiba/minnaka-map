'use client'
import type { AxiosError, AxiosResponse } from 'axios'
import type { SubmitHandler } from 'react-hook-form'

import type { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'

import { useForm } from 'react-hook-form'
import { authSchema } from '~/app/lib/shemas/authSchema'
import { Button } from '../buttons/Button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './Form'
import { Input } from './Input'

export default function AuthForm() {
  const router = useRouter()

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit: SubmitHandler<z.infer<typeof authSchema>> = (data) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/sign_in`
    const headers = { 'Content-Type': 'application/json' }

    axios({ method: 'Post', url, data, headers })
      .then((res: AxiosResponse) => {
        localStorage.setItem('access-token', res.headers['access-token'])
        localStorage.setItem('client', res.headers.client)
        localStorage.setItem('uid', res.headers.uid)
        router.push('/')
      })
      .catch((e: AxiosError<{ error: string }>) => {
        console.error(e.message)
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
        <Button type="submit" className="h-auto py-3">ログイン</Button>
      </form>
    </Form>
  )
}
