import { DeleteAccount } from '~/components/ui/DeleteAccount'

export default function SettingsPage() {
  return (
    <>
      <header className="flex h-32 flex-col items-center justify-center bg-secondary md:h-48">
        <h1 className="px-5 text-lg font-bold sm:text-2xl">アカウント設定</h1>
      </header>
      <div className="mx-auto max-w-lg py-8 md:flex md:items-center md:justify-between md:py-10">
        <div>
          <p className="py-1 text-lg font-bold">アカウント削除</p>
          <p className="text-sm">削除すると復元はできません。</p>
        </div>
        <DeleteAccount />
      </div>
    </>
  )
}
