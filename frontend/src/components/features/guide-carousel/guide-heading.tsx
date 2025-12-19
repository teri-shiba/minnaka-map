import Image from 'next/image'

export default function GuideHeading() {
  return (
    <h2
      className="flex flex-wrap items-center justify-center gap-1 px-5 pb-4
                  text-lg text-secondary-foreground md:row-span-1
                  md:flex-nowrap md:justify-start md:pb-0 md:pl-5 md:text-2xl"
    >
      <span className="relative h-6 w-full max-w-48 md:h-[30px] md:max-w-60">
        <Image
          alt="みんなかマップ"
          src="/logo.webp"
          fill
          sizes="(max-width: 767px) 192px, 240px"
          priority
          className="object-contain object-left"
        />
      </span>
      <span className="shrink-0">の使い方</span>
    </h2>
  )
}
