'use client'

import Image from 'next/image'
import GuideCarousel from '~/components/features/carousels/guide-carousel'
import StationSearchForm from '~/components/features/station/search/station-search-form'
import Section from '~/components/layout/section'
import useConfirmEmail from '~/hooks/useConfirmEmail'
import useOAuthCallback from '~/hooks/useOAuthCallback'

export default function Home() {
  useOAuthCallback()
  useConfirmEmail()

  return (
    <>
      <Section className="bg-secondary py-12 md:py-16">
        <div className="grid md:grid-cols-2 md:gap-x-6">
          <h2 className="order-1 mx-auto mb-6 text-center md:col-span-1 md:row-span-1 md:ml-0 md:mr-auto md:mt-auto md:text-left">
            <span className="mb-1 inline-block text-lg text-secondary-foreground md:mb-2 md:text-xl">みんなのまんなか</span>
            <Image
              alt="minnaka map"
              src="/logo.webp"
              width={224}
              height={29}
              priority
              className="block"
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
              className="hidden md:block"
            />
            <Image
              alt=""
              src="/mv_sp.webp"
              width={264}
              height={183}
              priority
              className="block md:hidden"
            />
          </div>
        </div>
      </Section>

      <Section className="py-14 md:py-24">
        <h2 className="mb-7 text-center text-lg text-secondary-foreground sm:text-2xl md:mb-12">
          <span className="inline-block align-text-bottom">
            <Image
              alt="minnaka map"
              src="/logo.webp"
              width={170}
              height={30}
              priority
              className="w-44 sm:w-60"
            />
          </span>
          <span className="inline-block pl-1">で、</span>
          <span className="inline-block">集まろう！</span>
        </h2>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-3 md:gap-6">
          <div className="flex flex-col items-center justify-center">
            <Image
              alt="featureFriends"
              src="/image_feature_01.webp"
              width={170}
              height={149}
              className="mb-4"
            />
            <h3 className="mb-2 text-lg text-secondary-foreground">友人との集まりに</h3>
            <p className="text-center text-sm leading-6 text-secondary-foreground">
              みんなの中間地点と周辺の飲食店を提案。
              <br />
              集まる場所選びがスムーズに！
              <br />
              楽しい時間の計画をお手伝いします。
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              alt="featureDate"
              src="/image_feature_02.webp"
              width={170}
              height={148}
              className="mb-4"
            />
            <h3 className="mb-2 text-lg text-secondary-foreground">デートの場所選びに</h3>
            <p className="text-center text-sm leading-6 text-secondary-foreground">
              ふたりの中間地点とおすすめ飲食店を提案。
              <br />
              素敵なデートスポットが簡単に見つかるので、
              <br />
              思い出に残るデートが実現できます。
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              alt="featureBusiness"
              src="/image_feature_03.webp"
              width={170}
              height={149}
              className="mb-4"
            />
            <h3 className="mb-2 text-lg text-secondary-foreground">ミーティングの場所設定に</h3>
            <p className="text-center text-sm leading-6 text-secondary-foreground">
              参加者に最適な中間地点を特定。
              <br />
              近くのカフェやレストランを表示するので、
              <br />
              効率的な場所選定が可能です。
            </p>
          </div>
        </div>
      </Section>

      <Section className="relative mb-24">
        <div className="section-guide">
          <GuideCarousel className="sm:flex sm:items-center sm:justify-between" />
        </div>
      </Section>
    </>
  )
}
