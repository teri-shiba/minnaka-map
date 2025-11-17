export function getOAuthUrl(provider: string): string {
  const url = new URL(
    `/api/v1/auth/${provider}`,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  )

  return url.toString()
}
