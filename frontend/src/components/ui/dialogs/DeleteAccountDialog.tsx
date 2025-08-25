'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import { Button } from '../buttons/Button'
import DeleteAccountForm from '../forms/DeleteAccountForm'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const user = useAtomValue(userStateAtom)
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
        <DialogHeader className="flex flex-col space-y-3">
          <DialogTitle className="text-center">
            アカウントを削除しようとしています
          </DialogTitle>
          <DialogDescription className="leading-6 text-foreground">
            {getDeleteDescription(user.provider)}
            <br />
            この操作は戻すことができません。
          </DialogDescription>
        </DialogHeader>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
