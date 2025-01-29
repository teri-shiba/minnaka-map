'use client'

import Image from 'next/image'
import { useState } from 'react'
import * as React from 'react'
import { FiShare } from 'react-icons/fi'
import { IoMail } from 'react-icons/io5'
import Line from '~/public/icon_line.svg'
import logo from '~/public/logo.webp'
import { Button } from '../buttons/Button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

export function ShareDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link">
          <FiShare />
          <span>シェアする</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="mx-auto">
            <Image
              src={logo}
              alt="minnaka map"
              width={224}
              height={28}
            />
          </DialogTitle>
          <DialogDescription className="text-center">
            気になるお店をみんなにシェアしよう！
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  )
}
