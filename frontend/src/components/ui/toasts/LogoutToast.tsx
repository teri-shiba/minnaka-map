'use client'

import { toast } from 'sonner'

import { Button } from '../buttons/Button'

export function LogoutToast() {
  return (
    <Button
      variant="round"
      onClick={() =>
        toast.success('ログアウトしました')}
    >
      ログアウト
    </Button>
  )
}
