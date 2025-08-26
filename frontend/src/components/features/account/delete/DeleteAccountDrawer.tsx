'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import { Button } from '../../../ui/buttons/Button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '../../../ui/drawers/Drawer'
import DeleteAccountForm from './DeleteAccountForm'

export function DeleteAccountDrawer() {
  const [open, setOpen] = useState(false)
  const user = useAtomValue(userStateAtom)

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          className="border border-destructive bg-white text-destructive hover:bg-destructive hover:text-white"
        >
          削除する
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mb-8">
        <DrawerHeader>
          <DrawerTitle className="text-left">
            アカウントを削除しようとしています
          </DrawerTitle>
        </DrawerHeader>
        <p className="pb-4 text-sm leading-6">
          {getDeleteDescription(user.provider)}
          <br />
          この操作は取り消すことができません。
          {user.provider === 'email' && '確認のため、登録中のメールアドレスを入力してください。'}
        </p>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
