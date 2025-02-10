'use client'
import Image from 'next/image'
import { LuPlus } from 'react-icons/lu'
import { Button } from '~/components/ui/buttons/Button'
import { DesktopGuideCarousel } from '~/components/ui/carousels/DesktopGuideCarousel'
import { MobileGuideCarousel } from '~/components/ui/carousels/MobileGuideCarousel'

// TODO：画像変数のインポートが多いので、まとめてインポートする構造に変更する
import wavePC from '~/public/figure_wave_pc.webp'
import waveSP from '~/public/figure_wave_sp.webp'
import featureFriends from '~/public/image_feature_01.webp'
import featureDate from '~/public/image_feature_02.webp'
import featureBusiness from '~/public/image_feature_03.webp'
import logo from '~/public/logo.webp'
import mvPC from '~/public/mv_01_pc.webp'
import mvSP from '~/public/mv_01_sp.webp'

import { Section } from './components/layout/Section'
import useConfirmEmail from './hooks/useConfirmEmail'
import useOAuthCallback from './hooks/useOAuthCallback'

export default function Home() {
  useOAuthCallback()
  useConfirmEmail()

  return (
    <>
      <Section className="bg-secondary py-12 md:py-4">
        <div className="flex flex-col items-center justify-center md:flex-row md:justify-between">
          <div>
            <h2 className="text-center md:text-left">
              <span className="text-lg text-secondary-foreground sm:text-xl">みんなのまんなか</span>
              <Image
                alt="minnaka map"
                src={logo}
                width={224}
                height={28}
                className=""
              />
            </h2>

            {/* フォームはあとで実装 */}

            <Button variant="link" className="text-secondary-foreground">
              <LuPlus className="stroke-[3]" />
              3人目を追加する
            </Button>

            <Button>検索する</Button>
          </div>

          <div>
            <Image
              alt="mv-pc"
              src={mvPC}
              width={424}
              height={536}
              className="hidden md:block"
            />

            <Image
              alt="mv-sp"
              src={mvSP}
              width={264}
              height={184}
              className="block md:hidden"
            />
          </div>
        </div>
      </Section>

      <div>
        <Image
          alt=""
          src={wavePC}
          width={1280}
          height={96}
          className="hidden h-24 w-full md:block"
        />
        <Image
          alt=""
          src={waveSP}
          width={393}
          height={48}
          className="block h-12 w-full md:hidden"
        />
      </div>

      <Section className="py-14 md:py-24">
        <h2 className="mb-7 text-center text-lg text-secondary-foreground sm:text-2xl md:mb-12">
          <span className="inline-block align-text-bottom">
            <Image
              alt="minnaka map"
              src={logo}
              width={170}
              height={30}
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
              src={featureFriends}
              width={170}
              height={150}
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
              src={featureDate}
              width={170}
              height={150}
              className="mb-4"
            />
            <h3 className="mb-2 text-lg text-secondary-foreground">デートの場所選びに</h3>
            <p className="text-center text-sm leading-6 text-secondary-foreground">
              みんなの中間地点と周辺の飲食店を提案。
              <br />
              ふたりの中間地点とおすすめ飲食店を提案。
              <br />
              思い出に残るデートが実現できます。
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Image
              alt="featureBusiness"
              src={featureBusiness}
              width={170}
              height={150}
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

      <MobileGuideCarousel />
      <DesktopGuideCarousel />
    </>
  )
}
