'use client'
import { useAtom } from 'jotai'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { userStateAtom } from '~/app/lib/state/userStateAtom'
import Logo from '~/public/logo.svg'
import { Auth } from '../ui/Auth'
import { LogoutDialog } from '../ui/dialogs/LogoutDialog'
import { Skeleton } from '../ui/skeleton/skeleton'

export default function Header() {
  const [user, setUser] = useAtom(userStateAtom)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const accessToken = localStorage.getItem('access-token')
    const client = localStorage.getItem('client')
    const uid = localStorage.getItem('uid')

    if (accessToken && client && uid) {
      setUser(user => ({
        ...user,
        isSignedIn: true,
      }))
    }
    else {
      setUser({
        id: 0,
        name: '',
        email: '',
        isSignedIn: false,
      })
    }
    setLoading(false)
  }, [setUser])

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
        {loading
          ? <Skeleton className="h-[40px] w-[102px] rounded-full" />
          : !user.isSignedIn ? <Auth /> : <LogoutDialog />}

      </div>
    </header>
  )
}
