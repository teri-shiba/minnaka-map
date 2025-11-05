import { render, screen, within } from '@testing-library/react'
import GuideCarousel from '~/components/features/guide-carousel/guide-carousel'
import * as useGuideCarouselModule from '~/hooks/useGuideCarousel'
import '@testing-library/jest-dom/vitest'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props} type="button">{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('next/image', () => ({
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} {...props} />,
}))

describe('GuideCarousel', () => {
  const mockStartSequenceFrom = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(useGuideCarouselModule, 'useGuideCarousel').mockReturnValue({
      activeIndex: 0,
      startSequenceFrom: mockStartSequenceFrom,
    })
  })

  it('PC のとき、grid-cols-2 のレイアウトで表示される', () => {
    const { container } = render(<GuideCarousel />)
    const pcLayout = container.querySelector('.md\\:grid-cols-2')
    expect(pcLayout).toBeInTheDocument()
  })

  it('PC のとき、GuideImage と GuideHeading と GuideStep が表示される', () => {
    const { container } = render(<GuideCarousel />)

    const pcLayout = container.querySelector('.md\\:grid-cols-2')
    const pcImage = pcLayout?.querySelector('img[alt="出発地点を入力する"]')
    const pcLogo = pcLayout?.querySelector('img[alt="minnaka map"]')

    expect(pcImage).toBeInTheDocument()
    expect(pcLogo).toBeInTheDocument()
    expect(within(pcLayout as HTMLElement).getByText('の使い方')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ステップ1 出発地点を入力する' })).toBeInTheDocument()
  })

  it('SP のとき、GuideDescription が表示される', () => {
    const { container } = render(<GuideCarousel />)

    const spLayout = container.querySelector('.md\\:hidden')
    const spImage = spLayout?.querySelector('img[alt="出発地点を入力する"]')

    expect(spImage).toBeInTheDocument()
    expect(within(spLayout as HTMLElement).getByText('出発地点を入力する')).toBeInTheDocument()
    expect(within(spLayout as HTMLElement).getByText('みんなの出発地点を入力すると、中心地点が自動で計算されます。最大6人まで設定可能です。')).toBeInTheDocument()
  })

  it('activeIndex が 0 のとき、最初のカルーセルデータが表示される', () => {
    render(<GuideCarousel />)

    const images = screen.getAllByAltText('出発地点を入力する')
    expect(images).toHaveLength(2)
    
    const texts = screen.getAllByText('みんなの出発地点を入力すると、中心地点が自動で計算されます。最大6人まで設定可能です。')
    expect(texts).toHaveLength(2)
  })

  it('activeIndex が 1 のとき、2番目のカルーセルデータが表示される', () => {
    vi.spyOn(useGuideCarouselModule, 'useGuideCarousel').mockReturnValue({
      activeIndex: 1,
      startSequenceFrom: mockStartSequenceFrom,
    })

    render(<GuideCarousel />)

    const images = screen.getAllByAltText('飲食店を調べる')
    expect(images).toHaveLength(2)

    const texts = screen.getAllByText('計算された中心地点周辺の飲食店が表示されます。条件を絞り込んで、みんなに合ったお店を探せます。')
    expect(texts).toHaveLength(2)
  })

  it('activeIndex が 2 のとき、3番目のカルーセルデータが表示される', () => {
    vi.spyOn(useGuideCarouselModule, 'useGuideCarousel').mockReturnValue({
      activeIndex: 2,
      startSequenceFrom: mockStartSequenceFrom,
    })

    render(<GuideCarousel />)

    const images = screen.getAllByAltText('シェアする')
    expect(images).toHaveLength(2)

    const texts = screen.getAllByText('決定した集合場所と飲食店の情報をLINEやメールで簡単に共有。みんなで待ち合わせ情報を確認できます。')
    expect(texts).toHaveLength(2)
  })

  it('SP のとき、displayStep は activeIndex + 1 の値になる', () => {
    render(<GuideCarousel />)

    const stepNumber = screen.getAllByText('1')[0]
    expect(stepNumber).toBeInTheDocument()
  })
})
