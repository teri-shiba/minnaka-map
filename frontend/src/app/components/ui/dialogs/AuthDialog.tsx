'use client'

import Image from 'next/image'
import { useState } from 'react'

import * as React from 'react'
import { authProviders } from '~/app/lib/authConstants'
import Mark from '~/public/mark.svg'
import { Button } from '../buttons/Button'
import LoginForm from '../forms/LoginForm'
import SignUpForm from '../forms/SignUpForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const baseApiURL = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleClick = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="round">ログイン</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            <div className="flex items-center gap-2 py-2">
              <Mark
                width={22}
                height={22}
              />
              <h2>
                {isLogin ? 'ログイン' : '新規会員登録'}
              </h2>
            </div>
          </DialogTitle>
        </DialogHeader>
        {isLogin
          ? <LoginForm onSuccess={() => setOpen(false)} />
          : <SignUpForm onSuccess={() => setOpen(false)} />}
        <p className="relative text-center text-sm text-gray-500 before:absolute before:left-0 before:top-1/2 before:-z-10 before:h-px before:w-full before:bg-gray-300">
          <span className="inline-block bg-white px-4">OR</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {authProviders.map(provider => (
            <a
              key={provider.name}
              href={`${baseApiURL}/auth/${provider.authUrl}`}
              className="flex h-auto items-center justify-center gap-2 rounded-md border border-input py-3 text-sm font-bold transition-colors hover:bg-accent"
            >
              <Image
                src={provider.iconImg}
                width={24}
                height={24}
                alt=""
              />
              {isLogin ? `${provider.name}でログイン` : `${provider.name}で登録`}
            </a>
          ))}
        </div>
        <Button onClick={handleClick} className="mx-auto my-4 inline-block h-auto !bg-transparent py-0 text-sm font-bold text-foreground hover:text-blue-500 hover:underline">
          {isLogin ? '新規会員登録はこちら' : 'ログインはこちら'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
