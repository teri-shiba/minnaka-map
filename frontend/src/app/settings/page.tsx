import Section from '~/components/layout/Section'
import { DeleteAccount } from '~/components/ui/DeleteAccount'

export default function SettingsPage() {
  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="px-5 text-lg font-bold sm:text-2xl">アカウント設定</h1>
      </header>
      <Section className="py-8 md:py-10">
        <div className="mx-auto flex max-w-lg justify-between md:items-center">
          <div>
            <p className="py-1 text-base font-bold md:text-lg">アカウント削除</p>
            <p className="text-xs md:text-sm">削除すると復元はできません。</p>
          </div>
          <DeleteAccount />
        </div>
      </Section>
    </>
  )
}
