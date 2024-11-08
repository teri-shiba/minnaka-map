'use client'

import { useState } from 'react'
import * as React from 'react'
import { Button } from '../buttons/Button'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './Dialog'

export function LogoutDialog() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="round">ログアウト</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader className="flex flex-col space-y-3">
          <DialogTitle className="text-center">
            ログアウト
          </DialogTitle>
          <DialogDescription className="text-center">
            ログアウトしますか？
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-auto py-3">キャンセル</Button>
          <Button variant="destructive" className="h-auto py-3">
            ログアウト
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
