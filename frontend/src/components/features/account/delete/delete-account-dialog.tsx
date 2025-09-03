'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import DeleteAccountContent from './delete-account-content'

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
          <DialogTitle>
            アカウントを削除しようとしています
          </DialogTitle>
        </DialogHeader>
        <DeleteAccountContent onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
