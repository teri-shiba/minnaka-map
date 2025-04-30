'use client'
import Image from 'next/image'
import { useState } from 'react'
import { FiShare } from 'react-icons/fi'
import { IoMail } from 'react-icons/io5'
import Line from '~/public/icon_line.svg'
import logo from '~/public/logo.webp'
import { Button } from '../buttons/Button'

import {
  DialogDescription,
} from '../dialogs/Dialog'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer'

export function ShareDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-none bg-gray-300 hover:bg-white [&_svg]:size-6">
          <FiShare />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader>
          <DrawerTitle className="mx-auto">
            <Image
              src={logo}
              alt="minnaka map"
              width={224}
              height={28}
            />
          </DrawerTitle>
          <DialogDescription className="text-center">
            気になるお店をみんなにシェアしよう！
          </DialogDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex h-auto items-center py-3 [&_svg]:size-6">
            <Line
              width={18}
              height={18}
              fill="none"
              style={{ display: 'block' }}
            />
            <span>LINEでシェア</span>
          </Button>
          <Button variant="outline" className="flex h-auto items-center py-3 [&_svg]:size-6">
            <IoMail
              width={18}
              height={18}
              className="text-primary"
            />
            <span>メールでシェア</span>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
