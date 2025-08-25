'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import { Button } from '../buttons/Button'
import DeleteAccountForm from '../forms/DeleteAccountForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './Dialog'

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
        <p className="text-sm leading-6">
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
