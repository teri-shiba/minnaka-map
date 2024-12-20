'use client'
import { useAtom } from 'jotai'
import Link from 'next/link'
import { userStateAtom } from '~/app/lib/state/userStateAtom'
import Logo from '~/public/logo.svg'
import { Auth } from '../ui/Auth'
import UserMenu from '../ui/dropdownmenu/UserMenu'
import { Skeleton } from '../ui/skeleton/Skeleton'

export default function Header() {
  const [user] = useAtom(userStateAtom)
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
        { user.isLoading
          ? <Skeleton className="h-[40px] w-[87px] rounded-full" />
          : (!user.isSignedIn
              ? <Auth />
              : <UserMenu />
            )}
      </div>
    </header>
  )
}
