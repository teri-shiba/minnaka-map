import Image from 'next/image'
import GuideCarousel from '~/components/features/guide-carousel/guide-carousel'
import StationSearchForm from '~/components/features/station/search/station-search-form'
import Section from '~/components/layout/section'
import { features } from '~/data/features'

export default function Home() {
  return (
    <>
      <Section className="bg-secondary py-12 md:py-16">
        <div className="grid md:grid-cols-2 md:gap-x-6">
          <h2 className="order-1 mx-auto mb-6 text-center md:col-span-1 md:row-span-1 md:ml-0 md:mr-auto md:mt-auto md:text-left">
            <span className="mb-1 inline-block text-lg text-secondary-foreground md:mb-2 md:text-xl">みんなのまんなか</span>
            <Image
              alt="みんなかマップ"
              src="/logo.webp"
              width={230}
              height={29}
              priority
              className="block h-auto"
            />
          </h2>

          <div className="order-3 md:col-span-1 md:row-span-1">
            <StationSearchForm />
          </div>

          <div className="order-2 mx-auto md:order-1 md:col-span-1 md:row-span-2">
            <Image
              alt=""
              src="/mv_pc.webp"
              width={424}
              height={533}
              priority
              fetchPriority="high"
              className="hidden md:block"
            />
            <Image
              alt=""
              src="/mv_sp.webp"
              width={270}
              height={180}
              priority
              fetchPriority="high"
              className="block md:hidden"
            />
          </div>
        </div>
      </Section>

      <Section className="py-14 md:py-24">
        <h2 className="mb-7 text-center text-lg text-secondary-foreground sm:text-2xl md:mb-12">
          <span className="inline-block align-text-bottom">
            <Image
              alt="みんなかマップ"
              src="/logo.webp"
              width={240}
              height={30}
              priority
              className="w-44 sm:w-60"
            />
          </span>
          <span className="inline-block pl-1">で、</span>
          <span className="inline-block">集まろう！</span>
        </h2>
        <div className="grid grid-cols-1 gap-7 sm:gap-2 md:grid-cols-3 md:gap-6">
          {features.map(feature => (
            <div
              key={feature.src}
              className="flex flex-col items-center justify-center"
            >
              <Image
                key={feature.src}
                alt={feature.title}
                src={feature.src}
                width={170}
                height={148}
                className="mb-4"
              />
              <h3 className="mb-2 text-lg text-secondary-foreground">
                {feature.title}
              </h3>
              <p className="max-w-80 whitespace-pre-line text-sm leading-6 text-secondary-foreground md:text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="relative sm:mb-6">
        <div className="section-guide">
          <GuideCarousel />
        </div>
      </Section>
    </>
  )
}
