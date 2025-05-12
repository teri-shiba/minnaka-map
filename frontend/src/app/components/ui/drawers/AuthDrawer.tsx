'use client'
import Image from 'next/image'
import { useState } from 'react'
import { authProviders } from '~/app/lib/authConstants'
import logoMark from '~/public/logo_mark.webp'
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
  const baseApiURL = process.env.NEXT_PUBLIC_API_BASE_URL

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
              <Image
                alt="mark"
                src={logoMark}
                width={24}
                height={24}
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
          <div className="flex gap-3 max-[383px]:block">
            {authProviders.map(provider => (
              <a
                key={provider.name}
                href={`${baseApiURL}/provider/${provider.authUrl}`}
                className="flex h-auto w-full items-center justify-center gap-2 rounded-md border border-input py-3 text-sm font-bold transition-colors hover:bg-accent max-[383px]:[&:not(:last-child)]:mb-3"
              >
                <Image
                  src={provider.iconImg}
                  width={18}
                  height={18}
                  alt=""
                />
                {isLogin ? `${provider.name}でログイン` : `${provider.name}で登録`}
              </a>
            ))}
          </div>
          <Button onClick={handleClick} className="mx-auto my-4 inline-block h-auto !bg-transparent py-0 text-sm font-normal text-foreground hover:text-blue-500 hover:underline">
            {isLogin ? '新規会員登録はこちら' : 'ログインはこちら'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
