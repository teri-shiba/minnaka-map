'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import * as React from 'react'
import Google from '../../../../../public/google.svg'
import Line from '../../../../../public/line.svg'
import { useMediaQuery } from '../../../../hooks/use-media-query'
import { cn } from '../../../../lib/utils'
import { Button } from '../../Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../Dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '../../Drawer'
import { Input } from '../../Input'
import { Label } from '../../Label'

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 640px)')

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="round">ログイン</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[470px]">
          <DialogHeader>
            <DialogTitle className="mx-auto">
              <Image
                src="logo.svg"
                alt="minnaka map"
                width={230}
                height={52}
              />
            </DialogTitle>
          </DialogHeader>
          <AuthForm />
          <p className="text-sm text-gray-500 text-center relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-[1px] before:bg-gray-300 before:-z-10">
            <span className="inline-block bg-white px-4">OR</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto [&_svg]:size-6 py-3" aria-label="Google">
              <Google
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
            <Button variant="outline" className="h-auto [&_svg]:size-6 py-3" aria-label="LINE">
              <Line
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
          </div>
          <Link href="#" className="inline-block mx-auto text-sm hover:text-blue-500 hover:underline">新規会員登録はこちら</Link>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="round">ログイン</Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader>
          <DrawerTitle className="mx-auto">
            <Image
              src="logo.svg"
              alt="minnaka map"
              width={230}
              height={52}
            />
          </DrawerTitle>
        </DrawerHeader>
        <AuthForm className="px-4" />
        <div className="grid items-start gap-4 mt-4">
          <p className="text-sm text-gray-500 text-center mx-5 relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-[1px] before:bg-gray-300 before:-z-10">
            <span className="inline-block bg-white px-4">OR</span>
          </p>
          <div className="grid grid-cols-2 gap-3 px-5">
            <Button variant="outline" className="h-auto [&_svg]:size-6 py-3" aria-label="Google">
              <Google
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
            <Button variant="outline" className="h-auto [&_svg]:size-6 py-3" aria-label="LINE">
              <Line
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
          </div>
          <Link href="#" className="inline-block mx-auto text-sm hover:text-blue-500 hover:underline">新規会員登録はこちら</Link>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function AuthForm({ className }: React.ComponentProps<'form'>) {
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
