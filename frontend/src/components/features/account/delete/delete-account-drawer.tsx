'use client'

import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '~/components/ui/drawer'
import DeleteAccountContent from './delete-account-content'

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
        <DrawerHeader>
          <DrawerTitle className="text-left">
            アカウントを削除しようとしています
          </DrawerTitle>
        </DrawerHeader>
        <DeleteAccountContent onClose={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  )
}
