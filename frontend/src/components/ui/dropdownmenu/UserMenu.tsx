import { Heart, LogOut, Settings, UserRound } from 'lucide-react'
import { logout } from '~/lib/actions/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu'
import { useAuth } from '~/hooks/useAuth'

export default function UserMenu() {
  const { logout } = useAuth()
  
  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex size-10 items-center justify-center rounded-full border border-orange-900/10 bg-white">
        <UserRound className="size-5 fill-current stroke-none text-primary" />
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
