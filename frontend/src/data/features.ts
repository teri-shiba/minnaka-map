import type { FeatureCard } from '~/types/features'

export const features: FeatureCard[] = [
  {
    src: '/image_feature_01.webp',
    title: '友人との集まりに',
    description: 'みんなの中間地点と周辺の飲食店を提案。\n集まる場所選びがスムーズに！\n楽しい時間の計画をお手伝いします。',
  },
  {
    src: '/image_feature_02.webp',
    title: 'デートの場所選びに',
    description: 'ふたりの中間地点とおすすめ飲食店を提案。\n素敵なデートスポットが簡単に見つかるので、\n思い出に残るデートが実現できます。',
  },
  {
    src: '/image_feature_03.webp',
    title: 'ミーティングの場所設定に',
    description: '参加者に最適な中間地点を特定。\n近くのカフェやレストランを表示するので、\n効率的な場所選定が可能です。',
  },
] as const
