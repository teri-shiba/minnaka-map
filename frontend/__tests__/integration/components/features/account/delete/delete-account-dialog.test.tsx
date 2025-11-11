import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAtomValue } from 'jotai'
import DeleteAccountDialog from '~/components/features/account/delete/delete-account-dialog'
import '@testing-library/jest-dom/vitest'

vi.mock('jotai')

const deleteAccountSpy = vi.fn()
vi.mock('~/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    deleteAccount: deleteAccountSpy,
  })),
}))

describe('DeleteAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('初期状態のとき、ダイアログが閉じている', () => {
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
    expect(dialogTitle).not.toBeInTheDocument()
  })

  it('削除するボタンをクリックしたとき、ダイアログが開く', async () => {
    const user = userEvent.setup()
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
    expect(dialogTitle).toBeInTheDocument()
  })

  it('ダイアログが開いているとき、DeleteAccountContent が表示される', async () => {
    const user = userEvent.setup()
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    expect(screen.getByText(/この操作は取り消すことができません/)).toBeInTheDocument()
  })

  it('メールアドレスが登録されているとき、メールアドレス入力フォームが表示される', async () => {
    const user = userEvent.setup()
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'line',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    expect(screen.getByPlaceholderText('登録中のメールアドレスを入力')).toBeInTheDocument()
    expect(screen.getByText(/ヒント:/)).toBeInTheDocument()
  })

  it('メールアドレスが登録されていないとき、メールアドレス入力フォームが表示されない', async () => {
    const user = userEvent.setup()
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: '',
      provider: 'line',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    expect(screen.queryByPlaceholderText('登録中のメールアドレスを入力')).not.toBeInTheDocument()
    expect(screen.queryByText(/ヒント:/)).not.toBeInTheDocument()
  })

  it('メールアドレスが登録されているとき、正しいメールアドレスを入力して送信すると、ダイアログが閉じる', async () => {
    const user = userEvent.setup()
    const mockDeleteAccount = vi.mocked(deleteAccountSpy).mockResolvedValue({ success: true })
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const emailInput = screen.getByPlaceholderText('登録中のメールアドレスを入力')
    await user.type(emailInput, 'test@example.com')

    const submitButton = screen.getByRole('button', { name: '削除する' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledOnce()
    })

    await waitFor(() => {
      const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
      expect(dialogTitle).not.toBeInTheDocument()
    })
  })

  it('メールアドレスが登録されているとき、間違ったメールアドレスを入力して送信すると、エラーメッセージが表示される', async () => {
    const user = userEvent.setup()
    const mockDeleteAccount = vi.mocked(deleteAccountSpy).mockResolvedValue({ success: true })
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const emailInput = screen.getByPlaceholderText('登録中のメールアドレスを入力')
    await user.type(emailInput, 'wrong@example.com')

    const submitButton = screen.getByRole('button', { name: '削除する' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('メールアドレスが一致しません')).toBeInTheDocument()
    })

    expect(mockDeleteAccount).not.toHaveBeenCalled()
  })

  it('メールアドレスが登録されていないとき、削除ボタンをクリックすると、ダイアログが閉じる', async () => {
    const user = userEvent.setup()
    const mockDeleteAccount = vi.mocked(deleteAccountSpy).mockResolvedValue({ success: true })
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: '',
      provider: 'google_oauth2',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const submitButton = screen.getByRole('button', { name: '削除する' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledOnce()
    })

    await waitFor(() => {
      const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
      expect(dialogTitle).not.toBeInTheDocument()
    })
  })

  it('キャンセルボタンをクリックしたとき、ダイアログが閉じる', async () => {
    const user = userEvent.setup()
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: 'test@example.com',
      provider: 'email',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const cancelButton = screen.getByRole('button', { name: 'キャンセル' })
    await user.click(cancelButton)

    await waitFor(() => {
      const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
      expect(dialogTitle).not.toBeInTheDocument()
    })
  })

  it('API通信に失敗したとき、ダイアログが開いたまま', async () => {
    const user = userEvent.setup()
    const mockDeleteAccount = vi.mocked(deleteAccountSpy).mockResolvedValue({
      success: false,
      error: new Error('Failed'),
    })
    vi.mocked(useAtomValue).mockReturnValue({
      id: 1,
      name: 'test user',
      email: '',
      provider: 'line',
      isSignedIn: true,
    })

    render(<DeleteAccountDialog />)

    const triggerButton = screen.getByRole('button', { name: '削除する' })
    await user.click(triggerButton)

    const submitButton = screen.getByRole('button', { name: '削除する' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalledOnce()
    })

    const dialogTitle = screen.queryByRole('heading', { name: 'アカウントを削除しようとしています' })
    expect(dialogTitle).toBeInTheDocument()
  })
})
