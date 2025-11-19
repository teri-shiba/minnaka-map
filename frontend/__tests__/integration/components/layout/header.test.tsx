import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createSWRWrapper } from '__tests__/helpers/swr-test-helpers'
import { server } from '__tests__/integration/setup/msw.server'
import { http, HttpResponse } from 'msw'
import Header from '~/components/layout/header'
import '@testing-library/jest-dom/vitest'

const mockReplace = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    replace: mockReplace,
  })),
  usePathname: vi.fn(() => '/'),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

vi.mock('~/hooks/useMediaQuery', () => ({
  useMediaQuery: vi.fn(() => true),
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  it('ローディング中のとき、スケルトンを表示する', () => {
    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => new Promise(() => { })),
    )

    const wrapper = createSWRWrapper()
    const { container } = render(<Header />, { wrapper })

    expect(container.querySelector('.h-10.w-\\[87px\\]')).toBeInTheDocument()
  })

  it('未認証のとき、ログインボタンを表示する', async () => {
    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => {
        return HttpResponse.json({ login: false })
      }),
    )

    const wrapper = createSWRWrapper()
    render(<Header />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })
  })

  it('認証済みのとき、UseMenu アイコンを表示する', async () => {
    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => {
        return HttpResponse.json({
          login: true,
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          provider: 'email',
        })
      }),
    )

    const wrapper = createSWRWrapper()
    render(<Header />, { wrapper })

    await waitFor(() => {
      const menuButton = screen.getByRole('button', { name: 'ユーザーメニュー' })
      expect(menuButton).toBeInTheDocument()
    })
  })

  it('ログアウトしたとき、ログインボタンが表示される', async () => {
    const user = userEvent.setup()
    const response = [
      HttpResponse.json({
        login: true,
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        provider: 'email',
      }),
      HttpResponse.json({ login: false }),
    ]

    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => response.shift()),
      http.delete('http://localhost/api/v1/auth/sign_out', () => HttpResponse.json()),
    )

    const wrapper = createSWRWrapper()
    render(<Header />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ユーザーメニュー' })).toBeInTheDocument()
    })

    const menuButton = screen.getByRole('button', { name: 'ユーザーメニュー' })
    await user.click(menuButton)
    await user.click(screen.getByText('ログアウト'))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    expect(mockReplace).toHaveBeenCalledWith('/')
  })

  it('ユーザーアイコンをクリックしたとき、ドロップダウンメニューが開く', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => {
        return HttpResponse.json({
          login: true,
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          provider: 'email',
        })
      }),
    )

    const wrapper = createSWRWrapper()
    render(<Header />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ユーザーメニュー' })).toBeInTheDocument()
    })

    const menuButton = screen.getByRole('button', { name: 'ユーザーメニュー' })
    await user.click(menuButton)

    expect(screen.getByText('お気に入り一覧')).toBeInTheDocument()
    expect(screen.getByText('アカウント設定')).toBeInTheDocument()
    expect(screen.getByText('ログアウト')).toBeInTheDocument()
  })

  it('ドロップダウンメニューのリンクが正しい href を持つ', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('http://localhost/api/v1/current/user/show_status', () => {
        return HttpResponse.json({
          login: true,
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          provider: 'email',
        })
      }),
    )

    const wrapper = createSWRWrapper()
    render(<Header />, { wrapper })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'ユーザーメニュー' })).toBeInTheDocument()
    })

    const menuButton = screen.getByRole('button', { name: 'ユーザーメニュー' })
    await user.click(menuButton)

    const favoritesLink = screen.getByText('お気に入り一覧').closest('a')
    expect(favoritesLink).toHaveAttribute('href', '/favorites')

    const settingsLink = screen.getByText('アカウント設定').closest('a')
    expect(settingsLink).toHaveAttribute('href', '/settings')
  })
})
