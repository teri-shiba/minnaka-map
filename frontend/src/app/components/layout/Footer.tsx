import Image from 'next/image'
import Link from 'next/link'
import logo from '~/public/logo.webp'

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
  return (
    <footer className="bg-background">
      <div className="mx-auto py-6 xl:container">
        <div className="flex flex-col items-center justify-between sm:flex-row">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              alt="minnaka map"
              src={logo}
              width={224}
              height={28}
              className="block"
            />
          </Link>
          <nav>
            <ul className="flex flex-wrap justify-center space-x-4 sm:justify-end sm:space-x-6">
              {NAV_ITEMS.map((item) => {
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="text-xs text-muted-foreground transition-colors hover:text-primary sm:text-sm">
                      {item.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
