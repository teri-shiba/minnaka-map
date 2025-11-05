import { act, fireEvent, render, screen, within } from '@testing-library/react'
import GuideCarousel from '~/components/features/guide-carousel/guide-carousel'
import '@testing-library/jest-dom/vitest'

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props} type="button">{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('GuideCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('レイアウト', () => {
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
  })

  describe('自動切り替え', () => {
    it('初期表示のとき、最初のカルーセルデータが表示される', () => {
      render(<GuideCarousel />)

      const images = screen.getAllByAltText('出発地点を入力する')
      expect(images).toHaveLength(2)

      const texts = screen.getAllByText('みんなの出発地点を入力すると、中心地点が自動で計算されます。最大6人まで設定可能です。')
      expect(texts).toHaveLength(2)
    })

    it('3秒後、2番目のカルーセルデータに自動で切り替わる', async () => {
      render(<GuideCarousel />)

      // 初期表示
      expect(screen.getAllByAltText('出発地点を入力する')).toHaveLength(2)

      // 3秒進める
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      const images = screen.getAllByAltText('飲食店を調べる')
      expect(images).toHaveLength(2)

      const texts = screen.getAllByText('計算された中心地点周辺の飲食店が表示されます。条件を絞り込んで、みんなに合ったお店を探せます。')
      expect(texts).toHaveLength(2)
    })

    it('6秒後、3番目のカルーセルデータに自動で切り替わる', async () => {
      render(<GuideCarousel />)

      // 6秒進める
      await act(async () => {
        vi.advanceTimersByTime(3000) // 1回目
      })

      await act(async () => {
        vi.advanceTimersByTime(3000) // 2回目
      })

      const images = screen.getAllByAltText('シェアする')
      expect(images).toHaveLength(2)

      const texts = screen.getAllByText('決定した集合場所と飲食店の情報をLINEやメールで簡単に共有。みんなで待ち合わせ情報を確認できます。')
      expect(texts).toHaveLength(2)
    })

    it('9秒後、最初のカルーセルデータに戻る', async () => {
      render(<GuideCarousel />)

      // 9秒進める
      await act(async () => {
        vi.advanceTimersByTime(3000) // 1回目
      })

      await act(async () => {
        vi.advanceTimersByTime(3000) // 2回目
      })

      await act(async () => {
        vi.advanceTimersByTime(3000) // 3回目
      })

      const images = screen.getAllByAltText('出発地点を入力する')
      expect(images).toHaveLength(2)
    })
  })

  describe('ユーザー操作', () => {
    it('ステップボタンをクリックすると、指定したステップに切り替わる', async () => {
      render(<GuideCarousel />)

      expect(screen.getAllByAltText('出発地点を入力する')).toHaveLength(2)

      const targetStep = screen.getByRole('button', { name: 'ステップ3 シェアする' })

      await act(async () => {
        fireEvent.click(targetStep)
      })

      const images = screen.getAllByAltText('シェアする')
      expect(images).toHaveLength(2)
    })

    it('ステップボタンをクリック後、再び自動切り替えが開始される', async () => {
      render(<GuideCarousel />)

      const targetStep = screen.getByRole('button', { name: 'ステップ2 飲食店を調べる' })

      await act(async () => {
        fireEvent.click(targetStep)
      })

      expect(screen.getAllByAltText('飲食店を調べる')).toHaveLength(2)

      await act(async () => {
        vi.advanceTimersByTime(3000)
      })

      const images = screen.getAllByAltText('シェアする')
      expect(images).toHaveLength(2)
    })
  })
})
