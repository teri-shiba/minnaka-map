'use client'

import { useState } from 'react'
import * as React from 'react'
import { Button } from '../buttons/Button'

import {
  DialogDescription,
} from '../dialogs/Dialog'

import DeleteAccountForm from '../forms/DeleteAccountForm'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './Drawer'

export function DeleteAccountDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="destructive" className="bg-white text-destructive border border-destructive">退会する</Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader className="flex flex-col space-y-2">
          <DrawerTitle className="text-center">
            アカウント削除
          </DrawerTitle>
          <DialogDescription className="text-left">
            この操作は戻すことができません。
            <br />
            確認のため、登録中のメールアドレスを入力してください。
          </DialogDescription>
        </DrawerHeader>
        <DeleteAccountForm />
      </DrawerContent>
    </Drawer>
  )
}
