'use client'

import { toast } from 'sonner'

import { Button } from '../buttons/Button'

export function DeleteAccountToast() {
  return (
    <Button
      variant="round"
      onClick={() =>
        toast.error('アカウントを削除しました')}
    >
      退会する
    </Button>
  )
}
