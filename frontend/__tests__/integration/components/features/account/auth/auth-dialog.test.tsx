import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthDialog } from '~/components/features/account/auth/auth-dialog'
import '@testing-library/jest-dom/vitest'

const loginSpy = vi.fn().mockResolvedValue(undefined)
const signupSpy = vi.fn().mockResolvedValue(undefined)

vi.mock('~/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: loginSpy,
    signup: signupSpy,
  })),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/restaurants'),
  useSearchParams: vi.fn(() => new URLSearchParams('q=sushi')),
}))

describe('AuthDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ログインボタンを押したとき、ダイアログが開く', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    expect(screen.getByRole('dialog', { name: /ログイン|新規会員登録/ })).toBeInTheDocument()
  })

  it('新規登録リンクをクリックしたとき、登録フォームに切り替わる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    await user.click(screen.getByText('新規登録'))
    expect(screen.getByRole('button', { name: '登録する' })).toBeInTheDocument()
  })

  it('新規登録表示中にログインリンクをクリックしたとき、ログインフォームに切り替わる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    await user.click(screen.getByText('新規登録'))

    const dialog = screen.getByRole('dialog')
    const descriptionElement = within(dialog).getByText(/アカウントをお持ちの方は、/).parentElement
    const loginLink = within(descriptionElement as HTMLElement).getByText('ログイン')

    await user.click(loginLink)

    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '登録する' })).not.toBeInTheDocument()
  })

  it('ログインフォームの送信が成功したとき、ダイアログを閉じる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    const dialog = await screen.findByRole('dialog', { name: /ログイン|新規会員登録/ })

    await user.type(within(dialog).getByLabelText('メールアドレス'), 'test@example.com')
    await user.type(within(dialog).getByLabelText('パスワード'), 'Password123@')

    await user.click(within(dialog).getByRole('button', { name: 'ログイン' }))

    expect(await screen.findByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('新規登録フォームの送信が成功したとき、ダイアログを閉じる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    const dialog = await screen.findByRole('dialog', { name: /ログイン|新規会員登録/ })
    await user.click(screen.getByText('新規登録'))

    await user.type(within(dialog).getByLabelText('ユーザー名'), 'testUser')
    await user.type(within(dialog).getByLabelText('メールアドレス'), 'test@example.com')
    await user.type(within(dialog).getByLabelText('パスワード'), 'Password123@')
    await user.type(within(dialog).getByLabelText('パスワード（確認用）'), 'Password123@')

    await user.click(within(dialog).getByRole('button', { name: '登録する' }))

    expect(await screen.findByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('ログイン画面を表示しているとき、OAuthボタンのテキストが「Googleでログイン」「LINEでログイン」になる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))

    expect(screen.getByText('Googleでログイン')).toBeInTheDocument()
    expect(screen.getByText('LINEでログイン')).toBeInTheDocument()
  })

  it('新規登録画面を表示しているとき、OAuthボタンのテキストが「Googleで登録」「LINEで登録」になる', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    await user.click(screen.getByText('新規登録'))

    expect(screen.getByText('Googleで登録')).toBeInTheDocument()
    expect(screen.getByText('LINEで登録')).toBeInTheDocument()
  })

  it('OAuthリンクをクリックしたとき、正しいOAuth URLが設定されている', async () => {
    const user = userEvent.setup()
    render(<AuthDialog />)

    await user.click(screen.getByRole('button', { name: 'ログイン' }))
    const googleLink = screen.getByText('Googleでログイン').closest('a')
    const lineLink = screen.getByText('LINEでログイン').closest('a')

    expect(googleLink).toHaveAttribute('href', expect.stringContaining('/api/v1/auth/google_oauth2'))
    expect(lineLink).toHaveAttribute('href', expect.stringContaining('/api/v1/auth/line'))
  })
})
