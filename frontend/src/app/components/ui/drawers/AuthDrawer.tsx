'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import * as React from 'react'
import Google from '~/public/google.svg'
import Line from '~/public/line.svg'
import { Button } from '../buttons/Button'

import AuthForm from '../forms/AuthForm'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer'

export function AuthDrawer() {
  const [open, setOpen] = useState(false)

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
        <AuthForm />
        <div className="grid items-start gap-4 mt-4">
          <p className="text-sm text-gray-500 text-center mx-5 relative before:absolute before:top-1/2 before:left-0 before:w-full before:h-[1px] before:bg-gray-300 before:-z-10">
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
        </div>
      </DrawerContent>
    </Drawer>
  )
}
