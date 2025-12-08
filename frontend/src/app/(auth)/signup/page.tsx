import Image from 'next/image'
import Link from 'next/link'
import SignUpForm from '~/components/features/account/auth/forms/signup-form'
import Section from '~/components/layout/section'
import { AUTH_PROVIDERS } from '~/constants'
import { getOAuthUrl } from '~/utils/get-oauth-url'

export default function SignupPage() {
  return (
    <Section className="">
      <div className="flex min-h-[calc(100dvh-theme(height.header)-theme(height.footer))] flex-1 flex-col items-center py-10 md:pt-32">
        <div className="flex w-full max-w-80 flex-col gap-5 py-5">
          <h1 className="text-center text-2xl">新規登録</h1>
          <SignUpForm />
          <div className="w-full border-t border-gray-200" />
          {AUTH_PROVIDERS.map(item => (
            <a
              key={item.name}
              href={getOAuthUrl(item.provider)}
              className="flex h-auto items-center justify-center gap-2 rounded-md border border-input py-3 text-sm font-bold transition-colors hover:bg-secondary"
            >
              <Image
                src={item.iconImg}
                width={20}
                height={20}
                alt=""
              />
              {item.name}
              で登録する
            </a>
          ))}
          <p className="text-center text-sm text-muted-foreground">
            アカウントをお持ちの方は、
            <Link href="/login" className="font-bold text-blue-500 hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </Section>
  )
}
