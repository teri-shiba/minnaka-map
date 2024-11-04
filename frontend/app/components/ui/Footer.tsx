import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react'

export default function Footer() {
  return (
    <footer className="bg-background">
      <div className="xl:container mx-auto px-5 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo.svg" alt="minnaka map" width={225} height={25} />
          </Link>
          <nav>
            <ul className="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
              <li>
                <Link href="/terms" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="https://forms.gle/K2vM7erf5y8eo8Nr9" className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
