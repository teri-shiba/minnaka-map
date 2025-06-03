import { Heart, LogOut, Settings, UserRound } from 'lucide-react'
import { useAuth } from '~/hooks/useAuth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'

export default function UserMenu() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-full border border-orange-900/10 bg-muted">
        <UserRound className="size-5 text-primary" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Heart className="size-4 text-slate-400" />
          {' '}
          お気に入り一覧
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="size-4 text-slate-400" />
          {' '}
          設定
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="size-4 text-slate-400" />
          {' '}
          ログアウト
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
