export function getOAuthUrl(provider: string, redirectTo: string): string {
  const url = new URL(
    `/api/v1/auth/${provider}`,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  )
  url.searchParams.set('redirect_to', redirectTo)

  return url.toString()
}
