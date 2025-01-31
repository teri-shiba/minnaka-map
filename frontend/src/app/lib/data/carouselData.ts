interface CarouselData {
  id: number
  imageUrl: string
  title: string
  text: string
}

export const carouselData: CarouselData[] = [
  {
    id: 1,
    imageUrl: '/image_phone_01_sp.webp',
    title: '出発地点を入力する',
    text: 'みんなの出発地点を入力すると、中心地点が自動で計算されます。最大6人まで設定可能です。',
  },
  {
    id: 2,
    imageUrl: '/image_phone_02_sp.webp',
    title: '飲食店を調べる',
    text: '計算された中心地点周辺の飲食店が表示されます。条件を絞り込んで、みんなに合ったお店を探せます。',
  },
  {
    id: 3,
    imageUrl: '/image_phone_03_sp.webp',
    title: 'シェアする',
    text: '決定した集合場所と飲食店の情報をLINEやメールで簡単に共有。みんなで待ち合わせ情報を確認できます。',
  },
]
