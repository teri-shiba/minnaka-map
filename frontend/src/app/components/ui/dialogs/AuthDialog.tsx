'use client'

import Link from 'next/link'
import { useState } from 'react'
import * as React from 'react'
import Google from '~/public/google.svg'
import Line from '~/public/line.svg'
import Mark from '~/public/mark.svg'
import { Button } from '../buttons/Button'

import LoginForm from '../forms/LoginForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

export function AuthDialog() {
  const [open, setOpen] = useState(false)

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
              <h2>ログイン</h2>
            </div>
          </DialogTitle>
        </DialogHeader>
        <LoginForm />
        <p className="relative text-center text-sm text-gray-500 before:absolute before:left-0 before:top-1/2 before:-z-10 before:h-px before:w-full before:bg-gray-300">
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
        <Link href="#" className="mx-auto inline-block text-sm hover:text-blue-500 hover:underline">新規会員登録はこちら</Link>
      </DialogContent>
    </Dialog>
  )
}
