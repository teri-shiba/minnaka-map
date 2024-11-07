'use client'

import Link from 'next/link'
import * as React from 'react'
import { cn } from '~/lib/utils'
import { Button } from '../buttons/Button'

import { Input } from './Input'
import { Label } from './Label'

export default function AuthForm({ className }: React.ComponentProps<'form'>) {
  return (
    <form className={cn('grid items-start gap-4', className)}>
      <div className="grid gap-2">
        <Label htmlFor="email" className="font-bold">メールアドレス</Label>
        <Input type="email" id="email" placeholder="minnaka@example.com" className="h-auto py-3" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username" className="font-bold">パスワード</Label>
        <p className="text-xs text-gray-500">英数字と記号を含む8文字以上</p>
        <Input id="username" placeholder="password" className="h-auto py-3" />
      </div>
      <Link href="#" className="inline-block ml-auto text-sm hover:text-blue-500 hover:underline">パスワードを忘れた方はこちら</Link>
      <Button type="submit" className="h-auto py-3">ログイン</Button>
    </form>
  )
}
