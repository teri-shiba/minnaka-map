import Link from 'next/link'
import { HiUser } from 'react-icons/hi2'
import { LuHeart, LuLogOut, LuSettings } from 'react-icons/lu'
import { useAuth } from '~/hooks/useAuth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'

export default function UserMenu() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-orange-900/10 bg-muted">
        <HiUser className="size-5 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Link href="/favorites" className="flex items-center gap-2">
            <LuHeart className="size-4 text-slate-400" />
            お気に入り一覧
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <LuSettings className="size-4 text-slate-400" />
          {' '}
          設定
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LuLogOut className="size-4 text-slate-400" />
          {' '}
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
