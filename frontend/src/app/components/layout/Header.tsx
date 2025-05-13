'use client'
import { useAtom } from 'jotai'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { userStateAtom } from '~/app/lib/state/userStateAtom'
import logo from '~/public/logo.webp'
import logoMark from '~/public/logo_mark.webp'
import { Auth } from '../ui/Auth'
import UserMenu from '../ui/dropdownmenu/UserMenu'
import { Skeleton } from '../ui/skeleton/Skeleton'

export default function Header() {
  const [user] = useAtom(userStateAtom)
  const currentPath = usePathname()
  const isHomePage = currentPath === '/'
  const headerBgClass = isHomePage ? 'bg-secondary' : ''

  let userStatusUI = null
  if (user.isLoading) {
    userStatusUI = (
      <Skeleton className="h-[40px] w-[87px] rounded-full" />
    )
  }
  else if (!user.isSignedIn) {
    userStatusUI = <Auth />
  }
  else {
    userStatusUI = <UserMenu />
  }

  return (
    <header className={`w-full ${headerBgClass}`}>
      <div className="mx-auto flex h-16 max-w-screen-lg items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center">
          <Image
            aria-label="Go to Home"
            alt="logo"
            src={logo}
            width={224}
            height={29}
            priority
            className="hidden md:block"
          />
          <Image
            aria-label="Go to Home"
            alt="logo"
            src={logoMark}
            width={28}
            height={28}
            priority
            className="block md:hidden"
          />
        </Link>
        {userStatusUI}
      </div>
    </header>
  )
}
