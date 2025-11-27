export async function getVerificationLink(email: string): Promise<string> {
  const url = new URL('/api/v1/test_helpers/verification_email', process.env.API_BASE_URL)
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, timeout: 60 }),
  })

  if (!response.ok)
    throw new Error('確認メールが見つかりませんでした')

  const data = await response.json()
  return data.verification_link
}
