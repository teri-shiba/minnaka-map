import Image from 'next/image'

export default function GuideHeading() {
  return (
    <>
      <h2 className="flex flex-wrap items-center justify-center gap-1 px-5 pb-4 text-lg text-secondary-foreground md:row-span-1 md:flex-nowrap md:justify-start md:pb-0 md:pl-5 md:text-2xl">
        <Image
          alt="みんなかマップ"
          src="/logo.webp"
          width={240}
          height={30}
          priority
          className="w-full max-w-48 md:max-w-60"
        />
        <span className="shrink-0">の使い方</span>
      </h2>
    </>
  )
}
