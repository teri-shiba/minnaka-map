'use client'

import Link from 'next/link'
import { useState } from 'react'
import { HiUser } from 'react-icons/hi2'
import { LuHeart, LuLogOut, LuSettings } from 'react-icons/lu'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'
import { useAuth } from '~/hooks/useAuth'
import { Button } from '../ui/button'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          size="icon"
          aria-label="ユーザーメニュー"
          className="size-10 rounded-full bg-muted hover:bg-muted"
        >
          <HiUser className="text-primary" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href="/favorites" onClick={() => setOpen(false)} className="block">
          <DropdownMenuItem className="flex items-center gap-2">
            <LuHeart className="size-4 text-slate-400" />
            お気に入り一覧
          </DropdownMenuItem>
        </Link>
        <Link href="/settings" onClick={() => setOpen(false)} className="block">
          <DropdownMenuItem>
            <LuSettings className="size-4 text-slate-400" />
            {' '}
            アカウント設定
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleLogout}>
          <LuLogOut className="size-4 text-slate-400" />
          {' '}
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
