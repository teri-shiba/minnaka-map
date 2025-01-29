'use client'
import { useAtom } from 'jotai'
import Image from 'next/image'
import Link from 'next/link'
import { userStateAtom } from '~/app/lib/state/userStateAtom'
import logo from '~/public/logo.webp'
import logoMark from '~/public/logo_mark.webp'
import { Auth } from '../ui/Auth'
import UserMenu from '../ui/dropdownmenu/UserMenu'
import { Skeleton } from '../ui/skeleton/Skeleton'

export default function Header() {
  const [user] = useAtom(userStateAtom)
  return (
    <header className="supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full backdrop-blur">
      <div className="mx-auto flex h-16 items-center justify-between gap-4 xl:container">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            alt="minnaka map"
            src={logo}
            width={224}
            height={28}
            className="hidden sm:block"
          />
          <Image
            alt="minnaka map"
            src={logoMark}
            width={28}
            height={28}
            className="block sm:hidden"
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
