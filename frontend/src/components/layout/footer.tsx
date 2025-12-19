'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/utils/cn'

interface NavItemProps {
  title: string
  href: string
}

const NAV_ITEMS: NavItemProps[] = [
  { title: '利用規約', href: '/terms' },
  { title: 'プライバシーポリシー', href: '/privacy' },
  { title: 'お問い合わせ', href: 'https://forms.gle/K2vM7erf5y8eo8Nr9' },
]

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className={cn(
      'bg-background h-16 flex items-center',
      pathname === '/result' && 'hidden md:block',
    )}
    >
      <div className="mx-auto flex w-full max-w-screen-lg flex-col items-center justify-between gap-2 px-5 md:flex-row md:gap-0">
        <Link href="/" className="max-w-44 md:max-w-56">
          <Image
            alt="みんなかマップ"
            src="/logo.webp"
            width={230}
            height={29}
            className="block h-auto"
          />
        </Link>
        <nav aria-label="フッターナビゲーション">
          <div className="flex flex-wrap gap-4">
            {NAV_ITEMS.map((item) => {
              return (
                <Link key={item.href} href={item.href} className="text-xs text-gray-400 hover:text-gray-500">
                  {item.title}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </footer>
  )
}
