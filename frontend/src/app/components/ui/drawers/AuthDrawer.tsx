'use client'

import { useState } from 'react'
import * as React from 'react'
import Google from '~/public/google.svg'
import Line from '~/public/line.svg'
import Mark from '~/public/mark.svg'
import { Button } from '../buttons/Button'
import LoginForm from '../forms/LoginForm'
import SignUpForm from '../forms/SignUpForm'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer'

export function AuthDrawer() {
  const [open, setOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  const handleClick = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="round">ログイン</Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader>
          <DrawerTitle className="mx-auto">
            <div className="flex items-center gap-2 py-1">
              <Mark
                width={22}
                height={22}
              />
              <h2>
                {isLogin ? 'ログイン' : '新規会員登録'}
              </h2>
            </div>
          </DrawerTitle>
        </DrawerHeader>
        {isLogin
          ? <LoginForm onSuccess={() => setOpen(false)} />
          : <SignUpForm onSuccess={() => setOpen(false)} />}
        <div className="mt-4 grid items-start gap-4">
          <p className="relative mx-5 text-center text-sm text-gray-500 before:absolute before:left-0 before:top-1/2 before:-z-10 before:h-px before:w-full before:bg-gray-300">
            <span className="inline-block bg-white px-4">OR</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto py-3 [&_svg]:size-6" aria-label="Google">
              <Google
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
            <Button variant="outline" className="h-auto py-3 [&_svg]:size-6" aria-label="LINE">
              <Line
                width={24}
                height={24}
                fill="none"
                style={{ display: 'block' }}
              />
            </Button>
          </div>
          <Button onClick={handleClick} className="mx-auto my-4 inline-block h-auto !bg-transparent py-0 text-sm font-normal text-foreground hover:text-blue-500 hover:underline">
            {isLogin ? '新規会員登録はこちら' : 'ログインはこちら'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
