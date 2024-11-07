'use client'

import Image from 'next/image'
import { useState } from 'react'
import * as React from 'react'
import { FiShare } from 'react-icons/fi'
import { IoMail } from 'react-icons/io5'
import Line from '~/public/line.svg'
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
        <Button variant="link">
          <FiShare />
          <span>シェアする</span>
        </Button>
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
          <DialogDescription className="text-center">
            気になるお店をみんなにシェアしよう！
          </DialogDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="flex items-center h-auto [&_svg]:size-6 py-3">
            <Line
              width={18}
              height={18}
              fill="none"
              style={{ display: 'block' }}
            />
            <span>LINEでシェア</span>
          </Button>
          <Button variant="outline" className="flex items-center h-auto [&_svg]:size-6 py-3">
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
