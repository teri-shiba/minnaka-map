'use client'

import { useAtom } from 'jotai'
import Image from 'next/image'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { AUTH_PROVIDERS, dynamicPaths } from '~/constants'
import { authModalOpenAtom } from '~/state/auth-modal-open.atom'
import { apiHref } from '~/utils/api-url'
import LoginForm from './forms/login-form'
import SignUpForm from './forms/signup-form'

export function AuthDialog() {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="round">ログイン</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            <div className="flex items-center gap-2 py-2">
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
          </DialogTitle>
          <DialogDescription className="text-center">
            {messageText}
            <span onClick={handleClick} className={descClassName}>
              {linkText}
            </span>
          </DialogDescription>
        </DialogHeader>
        {isLogin
          ? <LoginForm onSuccess={() => setOpen(false)} />
          : <SignUpForm onSuccess={() => setOpen(false)} />}
        <p className="relative text-center text-sm text-gray-500 before:absolute before:left-0 before:top-1/2 before:-z-10 before:h-px before:w-full before:bg-gray-300">
          <span className="inline-block bg-white px-4">OR</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {AUTH_PROVIDERS.map(provider => (
            <a
              key={provider.name}
              href={apiHref(dynamicPaths.oauthProvider(provider.provider))}
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
      </DialogContent>
    </Dialog>
  )
}
