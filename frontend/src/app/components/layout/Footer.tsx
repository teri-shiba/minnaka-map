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
    <footer className="absolute top-full w-full bg-background">
      <div className="mx-auto max-w-screen-lg px-5 py-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              alt="minnaka map"
              src={logo}
              width={224}
              height={29}
              className="block"
            />
          </Link>
          <nav>
            <ul className="mt-3 flex flex-wrap justify-center md:mt-0 md:justify-end">
              {NAV_ITEMS.map((item) => {
                return (
                  <li key={item.href} className="text-center md:text-left">
                    <Link href={item.href} className="p-2 text-xs text-muted-foreground transition-colors hover:text-primary md:px-4 md:py-2 md:text-sm">
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
