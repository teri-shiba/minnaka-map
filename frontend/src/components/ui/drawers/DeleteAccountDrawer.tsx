'use client'

import { useAtomValue } from 'jotai'
import { useState } from 'react'
import { userStateAtom } from '~/state/user-state.atom'
import { getDeleteDescription } from '~/utils/get-delete-description'
import { Button } from '../buttons/Button'
import { DialogDescription } from '../dialogs/Dialog'
import DeleteAccountForm from '../forms/DeleteAccountForm'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './Drawer'

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
        <DrawerHeader className="flex flex-col space-y-2">
          <DrawerTitle className="text-center">
            アカウント削除
          </DrawerTitle>
          <DialogDescription className="text-left text-foreground">
            {getDeleteDescription(user.provider)}
            <br />
            この操作は戻すことができません。
          </DialogDescription>
        </DrawerHeader>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
