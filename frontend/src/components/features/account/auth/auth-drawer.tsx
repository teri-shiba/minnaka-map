'use client'

import { useAtom } from 'jotai'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import { AUTH_PROVIDERS, dynamicPaths } from '~/constants'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { apiHref } from '~/utils/api-url'
import LoginForm from './forms/login-form'
import SignUpForm from './forms/signup-form'

export function AuthDrawer() {
  const [open, setOpen] = useAtom(authModalOpenAtom)
  const [isLogin, setIsLogin] = useState(true)

  const handleClick = () => {
    setIsLogin(!isLogin)
  }

  const linkText = isLogin ? '新規登録' : 'ログイン'
  const messageText = isLogin
    ? 'アカウントをお持ちでない方は、'
    : 'アカウントをお持ちの方は、'
  const descClassName = 'font-bold text-foreground hover:text-blue-500 hover:underline cursor-pointer'

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
                src="/logo_mark.webp"
                width={24}
                height={24}
              />
              <h2>
                {isLogin ? 'ログイン' : '新規会員登録'}
              </h2>
            </div>
          </DrawerTitle>
          <DrawerDescription className="text-center">
            {messageText}
            <span onClick={handleClick} className={descClassName}>
              {linkText}
            </span>
          </DrawerDescription>
        </DrawerHeader>
        {isLogin
          ? <LoginForm onSuccess={() => setOpen(false)} />
          : <SignUpForm onSuccess={() => setOpen(false)} />}
        <div className="mt-4 grid items-start gap-4">
          <p className="relative mx-5 text-center text-sm text-gray-500 before:absolute before:left-0 before:top-1/2 before:-z-10 before:h-px before:w-full before:bg-gray-300">
            <span className="inline-block bg-white px-4">OR</span>
          </p>
          <div className="flex gap-3 max-[383px]:block">
            {AUTH_PROVIDERS.map(provider => (
              <a
                key={provider.name}
                href={apiHref(dynamicPaths.oauthProvider(provider.authUrl))}
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
        </div>
      </DrawerContent>
    </Drawer>
  )
}
