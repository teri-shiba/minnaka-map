import { act, fireEvent, render, screen } from '@testing-library/react'
import { createSWRWrapper } from '__tests__/helpers/swr-test-helpers'
import { server } from '__tests__/integration/setup/msw.server'
import { http, HttpResponse } from 'msw'
import { toast } from 'sonner'
import StationSearchForm from '~/components/features/station/search/station-search-form'
import { logger } from '~/lib/logger'
import { getMidpoint } from '~/services/get-midpoint'
import '@testing-library/jest-dom/vitest'

const DEBOUNCE_MS = 300

const mockRouterPush = vi.fn()
const mockRouterPrefetch = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockRouterPush,
    prefetch: mockRouterPrefetch,
  })),
}))
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

vi.mock('~/services/get-midpoint', () => ({ getMidpoint: vi.fn() }))
vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))
vi.mock('~/public/figure_loading_circle.svg', () => ({
  default: () => null,
}))

function setupStationsAPI() {
  server.use(
    http.get('*/api/v1/stations', ({ request }) => {
      const url = new URL(request.url)
      const query = url.searchParams.get('q')

      const stationMap: Record<string, any[]> = {
        東京: [{ id: 1, name: '東京', latitude: '35.11111', longitude: '139.11111' }],
        新宿: [{ id: 2, name: '新宿', latitude: '35.22222', longitude: '139.22222' }],
        渋谷: [{ id: 3, name: '渋谷', latitude: '35.33333', longitude: '139.33333' }],
      }

      return HttpResponse.json({ stations: stationMap[query || ''] || [] })
    }),
  )
}

describe('StationSearchForm', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
    sessionStorage.clear()

    globalThis.ResizeObserver = class ResizeObserver {
      observe() { }
      unobserve() { }
      disconnect() { }
    }

    setupStationsAPI()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('送信ボタン', () => {
    it('送信開始時にボタンをクリックしたとき、ボタンが無効化され「検索中...」になる', async () => {
      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.12345', lng: '139.12345' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('検索中...')

      await act(async () => {
        await Promise.resolve()
      })
    })

    it('送信中にボタンを連打しても、getMidpoint は1回だけ呼ばれる', async () => {
      let resolveGetMidpoint: (value: any) => void
      vi.mocked(getMidpoint).mockImplementation(() => {
        return new Promise((resolve) => {
          resolveGetMidpoint = resolve
        })
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))
      expect(input1).toHaveValue('東京')

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))
      expect(input2).toHaveValue('新宿')

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(vi.mocked(getMidpoint)).toHaveBeenCalledTimes(1)

      await act(async () => {
        resolveGetMidpoint!({
          success: false,
          data: {
            midpoint: { lat: '35.12345', lng: '139.12345' },
            sig: 'SIGNED',
            exp: 'EXPIRES',
          },
        })
      })
    })

    it('API通信に成功したとき、ボタンの無効化が解除される', async () => {
      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.12345', lng: '139.12345' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(mockRouterPush).toHaveBeenCalled()
      expect(submitButton).toHaveTextContent('検索する')
    })
  })

  describe('成功フロー', () => {
    it('API通信が成功したとき、lat, lng, stationIds で URL を生成して prefetch 後に push する', async () => {
      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.11111', lng: '139.11111' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(vi.mocked(getMidpoint)).toHaveBeenCalledWith([1, 2])
      expect(mockRouterPrefetch).toHaveBeenCalledWith(
        expect.stringContaining('/result?lat=35.11111&lng=139.11111&stationIds=1-2&sig=SIGNED&exp=EXPIRES'),
      )
      expect(mockRouterPush).toHaveBeenCalledWith(
        expect.stringContaining('/result?lat=35.11111&lng=139.11111&stationIds=1-2&sig=SIGNED&exp=EXPIRES'),
      )
    })
  })

  describe('失敗フロー', () => {
    it('API が success: false を返したとき、送信を中断してトーストを表示する', async () => {
      vi.mocked(getMidpoint).mockResolvedValue({
        success: false,
        message: 'APIエラーメッセージ',
        cause: 'REQUEST_FAILED',
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(toast.error).toHaveBeenCalledWith('APIエラーメッセージ')
      expect(mockRouterPush).not.toHaveBeenCalled()
    })

    it('送信処理が例外を投げたとき、logger が呼ばれトーストを表示する', async () => {
      const error = new Error('予期せぬエラーが発生しました')
      vi.mocked(getMidpoint).mockRejectedValue(error)

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(logger).toHaveBeenCalledWith(error, expect.objectContaining({
        component: 'StationSearchForm',
        action: 'processValidData',
      }))
      expect(toast.error).toHaveBeenCalledWith('フォームの送信に失敗しました。時間をおいてから、再度お試しください。')
      expect(mockRouterPush).not.toHaveBeenCalled()
    })
  })

  describe('sessionStorage の取り扱い', () => {
    it('初回送信時、stationIds を sessionStorage に保存する', async () => {
      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.11111', lng: '139.11111' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      const saved = sessionStorage.getItem('pendingStationIds')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed).toEqual([1, 2])
    })

    it('前回と同じ stationIds を 送信したとき、pendingSearchHistoryId は削除しない', async () => {
      sessionStorage.setItem('pendingStationIds', JSON.stringify([1, 2]))
      sessionStorage.setItem('pendingSearchHistoryId', '123')

      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.11111', lng: '139.11111' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(vi.mocked(getMidpoint)).toHaveBeenCalled()
      const historyId = sessionStorage.getItem('pendingSearchHistoryId')
      expect(historyId).toBe('123')
    })

    it('前回と異なる stationIds を 送信したとき、pendingSearchHistoryId を削除する', async () => {
      sessionStorage.setItem('pendingStationIds', JSON.stringify([3, 4]))
      sessionStorage.setItem('pendingSearchHistoryId', '123')

      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.11111', lng: '139.11111' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(vi.mocked(getMidpoint)).toHaveBeenCalled()
      const historyId = sessionStorage.getItem('pendingSearchHistoryId')
      expect(historyId).toBeNull()
    })

    it('stationIds は順序に依存しないので、同一集合なら削除しない', async () => {
      sessionStorage.setItem('pendingStationIds', JSON.stringify([2, 1]))
      sessionStorage.setItem('pendingSearchHistoryId', '123')

      vi.mocked(getMidpoint).mockResolvedValue({
        success: true,
        data: {
          midpoint: { lat: '35.11111', lng: '139.11111' },
          sig: 'SIGNED',
          exp: 'EXPIRES',
        },
      })

      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')
      const input2 = screen.getByPlaceholderText('2人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      fireEvent.focus(input2)
      fireEvent.input(input2, { target: { value: '新宿' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('新宿')).toBeInTheDocument()
      fireEvent.click(screen.getByText('新宿'))

      const submitButton = screen.getByRole('button', { name: '検索する' })
      fireEvent.click(submitButton)

      await act(async () => {
        await Promise.resolve()
      })

      expect(vi.mocked(getMidpoint)).toHaveBeenCalled()
      const historyId = sessionStorage.getItem('pendingSearchHistoryId')
      expect(historyId).toBe('123')
    })
  })

  describe('動的行', () => {
    it('追加ボタンを押したとき、フィールドが最大6件まで増える', async () => {
      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      expect(screen.getByPlaceholderText('1人目の出発駅')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('2人目の出発駅')).toBeInTheDocument()

      const addButton = screen.getByRole('button', { name: /追加/ })

      fireEvent.click(addButton)
      expect(screen.getByPlaceholderText('3人目の出発駅')).toBeInTheDocument()

      fireEvent.click(addButton)
      expect(screen.getByPlaceholderText('4人目の出発駅')).toBeInTheDocument()

      fireEvent.click(addButton)
      expect(screen.getByPlaceholderText('5人目の出発駅')).toBeInTheDocument()

      fireEvent.click(addButton)
      expect(screen.getByPlaceholderText('6人目の出発駅')).toBeInTheDocument()

      expect(screen.queryByRole('button', { name: /追加する/ })).not.toBeInTheDocument()
    })

    it('削除ボタンを押したとき、当該フィールドが取り除かれる', async () => {
      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const addButton = screen.getByRole('button', { name: /追加/ })

      fireEvent.click(addButton)
      expect(screen.getByPlaceholderText('3人目の出発駅')).toBeInTheDocument()

      const deleteButton = screen.getAllByLabelText(/削除/)
      const thirdFieldDeleteButton = deleteButton[0]

      fireEvent.click(thirdFieldDeleteButton)

      expect(screen.queryByPlaceholderText('3人目の出発駅')).not.toBeInTheDocument()
      expect(screen.getByPlaceholderText('1人目の出発駅')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('2人目の出発駅')).toBeInTheDocument()
    })

    it('リセットボタンを押したとき、areaValue と stationId, lat, lng が初期化される', async () => {
      const wrapper = createSWRWrapper()
      render(<StationSearchForm />, { wrapper })

      const input1 = screen.getByPlaceholderText('1人目の出発駅')

      fireEvent.focus(input1)
      fireEvent.input(input1, { target: { value: '東京' } })

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEBOUNCE_MS)
      })

      expect(screen.getByText('東京')).toBeInTheDocument()
      fireEvent.click(screen.getByText('東京'))

      expect(input1).toHaveValue('東京')

      const resetButton = screen.getByLabelText(/リセット/)
      fireEvent.click(resetButton)

      expect(input1).toHaveValue('')
    })
  })
})
