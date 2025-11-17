'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import DeleteAccountForm from './delete-account-form'

export default function DeleteAccountDrawer() {
  const [open, setOpen] = useState(false)

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
        <DrawerHeader className="text-left">
          <DrawerTitle className="pb-2">アカウントを削除しようとしています</DrawerTitle>
          <DrawerDescription>
            この操作は取り消すことができません。
            <br />
            確認のため、登録中のメールアドレスを入力してください。
          </DrawerDescription>
        </DrawerHeader>
        <DeleteAccountForm onClose={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
