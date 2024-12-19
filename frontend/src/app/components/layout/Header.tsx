'use client'
import Link from 'next/link'
import useUser from '~/app/hooks/useUser'
import Logo from '~/public/logo.svg'
import { Auth } from '../ui/Auth'
import UserMenu from '../ui/dropdownmenu/UserMenu'
import { Skeleton } from '../ui/skeleton/Skeleton'

export default function Header() {
  const { isLogin, isError, isLoading } = useUser()

  if (isError) {
    console.error('認証情報を取得できませんでした')
    return null
  }

  return (
    <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 px-5 xl:container md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Logo
            width={220}
            height={35}
            style={{ display: 'block' }}
          />
        </Link>
        { isLoading
          ? <Skeleton className="h-[40px] w-[87px] rounded-full" />
          : (!isLogin
              ? <Auth />
              : <UserMenu />
            )}
      </div>
    </header>
  )
}
