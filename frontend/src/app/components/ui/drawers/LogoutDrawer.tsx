'use client'

import { useState } from 'react'
import * as React from 'react'
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

export function LogoutDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="round">ログアウト</Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader className="flex flex-col space-y-2">
          <DrawerTitle className="text-center">
            ログアウト
          </DrawerTitle>
          <DialogDescription className="text-center">
            ログアウトしますか？
          </DialogDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-3 px-5">
          <Button variant="outline" className="h-auto py-3">キャンセル</Button>
          <Button variant="destructive" className="h-auto py-3">
            ログアウト
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
