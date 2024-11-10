'use client'

import { useState } from 'react'
import * as React from 'react'
import { Button } from '../buttons/Button'

import DeleteAccountForm from '../forms/DeleteAccountForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="bg-white text-destructive border border-destructive">退会する</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader className="flex flex-col space-y-3">
          <DialogTitle className="text-center">
            アカウント削除
          </DialogTitle>
          <DialogDescription>
            この操作は戻すことができません。
            <br />
            確認のため、登録中のメールアドレスを入力してください。
          </DialogDescription>
        </DialogHeader>
        <DeleteAccountForm />
      </DialogContent>
    </Dialog>
  )
}
