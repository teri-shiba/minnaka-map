'use client'
import useUser from '~/app/hooks/useUser'
import { Toaster } from '../ui/toasts/Toast'
import Footer from './Footer'
import Header from './Header'

export default function ClientAuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { isError } = useUser()

  if (isError) {
    console.error('認証情報を取得できませんでした')
    return null
  }

  return (
    <>
      <Header />
      <main>
        {children}
      </main>
      <Toaster richColors />
      <Footer />
    </>
  )
}
