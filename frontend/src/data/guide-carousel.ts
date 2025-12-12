import type { GuideCarousel } from '~/types/guide-carousel'

export const guideCarousel = [
  {
    imageUrl: '/image_step_01.webp',
    title: '出発地点を入力する',
    text: 'みんなの出発地点を入力すると、中心地点が自動で計算されます。最大6人まで設定可能です。',
  },
  {
    imageUrl: '/image_step_02.webp',
    title: '飲食店を調べる',
    text: '計算された中心地点周辺の飲食店が表示されます。条件を絞り込んで、みんなに合ったお店を探せます。',
  },
  {
    imageUrl: '/image_step_03.webp',
    title: 'シェアする',
    text: '決定した集合場所と飲食店の情報をLINEやメールで簡単に共有。みんなで待ち合わせ情報を確認できます。',
  },
] as const satisfies readonly GuideCarousel[]

export type StepIndex = Extract<keyof typeof guideCarousel, number>
