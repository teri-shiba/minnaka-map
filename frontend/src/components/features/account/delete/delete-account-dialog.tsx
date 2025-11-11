'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import DeleteAccountForm from './delete-account-form'

export default function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="border border-destructive bg-white text-destructive hover:bg-destructive hover:text-white"
        >
          削除する
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[470px]">
        <DialogHeader>
          <DialogTitle className="pb-2">アカウントを削除しようとしています</DialogTitle>
          <DialogDescription>
            この操作は取り消すことができません。
            <br />
            確認のため、登録中のメールアドレスを入力してください。
          </DialogDescription>
        </DialogHeader>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
