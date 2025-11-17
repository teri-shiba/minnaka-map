vi.mock('~/lib/logger', () => ({ logger: vi.fn() }))

vi.mock('~/services/get-auth-from-cookie', () => ({
  getAuthFromCookie: vi.fn(),
}))
