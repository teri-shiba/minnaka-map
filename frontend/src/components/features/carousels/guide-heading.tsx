import Image from 'next/image'

export default function GuideHeading() {
  return (
    <>
      <h2 className="pb-3 pl-5 text-center text-lg text-secondary-foreground sm:text-left sm:text-2xl">
        <span className="inline-block align-text-bottom sm:align-text-top">
          <Image
            alt="minnaka map"
            src="/logo.webp"
            width={170}
            height={30}
            priority
            className="w-44 sm:w-60"
          />
        </span>
        <span className="inline-block pl-0.5 sm:pl-1">の使い方</span>
      </h2>
    </>
  )
}
