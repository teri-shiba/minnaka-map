'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import { Button } from '../../../ui/buttons/Button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialogs/Dialog'
import DeleteAccountForm from './DeleteAccountForm'

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
        <DialogHeader>
          <DialogTitle>
            アカウントを削除しようとしています
          </DialogTitle>
        </DialogHeader>
        <p className="pb-4 text-sm leading-6">
          {getDeleteDescription(user.provider)}
          <br />
          この操作は取り消すことができません。
          {user.provider === 'email' && '確認のため、登録中のメールアドレスを入力してください。'}
        </p>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
