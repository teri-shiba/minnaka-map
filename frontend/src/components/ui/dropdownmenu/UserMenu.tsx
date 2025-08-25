'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { HiUser } from 'react-icons/hi2'
import { LuHeart, LuLogOut, LuSettings } from 'react-icons/lu'
import { useAuth } from '~/hooks/useAuth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'

export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          onClick={() => setOpen(true)}
          className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border bg-muted"
        >
          <HiUser className="size-5 text-primary" />
        </div>
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
