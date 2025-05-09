import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { useCarousel } from '~/app/hooks/useCarousel'
import { carouselData } from '~/app/lib/data/carouselData'
import { images } from '~/lib/image/images'
import { Section } from '../../layout/Section'

export function DesktopGuideCarousel() {
  const { activeStep, startSequenceFrom } = useCarousel(carouselData, {
    initialStep: 1,
    autoPlay: true,
    interval: 3000,
  })

  return (
    <Section className="relative mb-24 hidden md:block">
      <div className="relative flex items-center justify-between py-20">
        <div className="absolute -left-1/4 top-0 h-full w-1/2 overflow-hidden rounded-[2rem] bg-secondary">
          <Image
            alt=""
            src="/figure_01.webp"
            width={630}
            height={580}
            className="absolute -left-1/3 -top-1/4"
          />
          <Image
            alt=""
            src="/figure_02.webp"
            width={600}
            height={600}
            className="absolute -bottom-1/4 -right-1/3"
          />
        </div>
        <div className="w-1/2 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="inline-block drop-shadow-xl"
            >
              <Image
                alt={carouselData.find(data => data.id === activeStep)?.title || ''}
                src={carouselData.find(data => data.id === activeStep)?.imageUrl || ''}
                width={280}
                height={560}
                className="rounded-lg"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex w-1/2 flex-col gap-4">
          <h2 className="mb-3 pl-5 text-2xl text-secondary-foreground">
            <span className="inline-block align-text-top">
              <Image
                alt="minnaka map"
                src={images.logo}
                width={170}
                height={30}
                priority
                className="w-44 sm:w-60"
              />
            </span>
            <span className="inline-block pl-1">の使い方</span>
          </h2>
          {carouselData.map(data => (
            <motion.div
              key={data.id}
              className="relative cursor-pointer rounded-lg p-5 transition-colors"
              onClick={() => { startSequenceFrom(data.id) }}
            >
              <AnimatePresence>
                {activeStep === data.id && (
                  <motion.div
                    layoutId="activeStep"
                    className="absolute inset-0 -z-10 rounded-lg bg-secondary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="relative">
                <h3 className="flex items-center justify-start gap-2 pb-3 text-lg text-secondary-foreground">
                  <span className="flex size-9 items-center justify-center rounded-md bg-primary text-white">
                    {data.id}
                  </span>
                  {data.title}
                </h3>
                <p className="pl-12 text-sm text-secondary-foreground">{data.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  )
}
