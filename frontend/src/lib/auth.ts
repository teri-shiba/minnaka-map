import { cookies } from 'next/headers'

interface UserState {
  id: number
  name: string
  email: string
  isSignedIn: boolean
  isLoading: boolean
}

export async function getAuthStatus(): Promise<UserState | null> {
  console.log('🔍 getAuthStatus called')

  try {
    const baseURL = process.env.API_BASE_URL
    console.log('🌐 Base URL:', baseURL)

    const cookieStore = await cookies()

    // auth_cookie からJSONデータを取得
    const authCookie = cookieStore.get('auth_cookie')?.value
    console.log('🍪 auth_cookie:', authCookie ? 'present' : 'missing')
    console.log('🍪 Current auth_cookie present:', !!authCookie)

    if (!authCookie) {
      console.log('❌ No auth_cookie, returning null')
      return null
    }

    let authData = null
    if (authCookie) {
      try {
        // URLデコードしてからJSONパース
        const decodedCookie = decodeURIComponent(authCookie)
        authData = JSON.parse(decodedCookie)
        console.log('🔑 Parsed auth data:', Object.keys(authData))
      }
      catch (error) {
        console.error('❌ Failed to parse auth_cookie:', error)
      }
    }

    const cookieHeader = cookieStore.toString()
    console.log('🍪 Cookie header length:', cookieHeader.length)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Cookieヘッダーを追加
    if (cookieHeader) {
      headers.Cookie = cookieHeader
    }

    // devise-token-auth のヘッダーを追加（JSONから取得）
    if (authData) {
      if (authData['access-token']) {
        headers['access-token'] = authData['access-token']
        console.log('🔑 Added access-token header')
      }
      if (authData.client) {
        headers.client = authData.client
        console.log('🔑 Added client header')
      }
      if (authData.uid) {
        headers.uid = authData.uid
        console.log('🔑 Added uid header')
      }
    }

    const fullURL = `${baseURL}/current/user/show_status`
    console.log('🚀 Making request to:', fullURL)

    const response = await fetch(fullURL, {
      headers,
      credentials: 'include',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })

    console.log('📡 Response status:', response.status)
    console.log('📡 Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Error response body (first 200 chars):', errorText.substring(0, 200))

      // 401, 404, 403 を未認証として扱う
      if ([401, 404, 403].includes(response.status)) {
        console.log(`👤 User not authenticated (${response.status})`)
        return null
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('📦 API Response:', data)

    const userState: UserState = {
      id: data.id || 0,
      name: data.name || '',
      email: data.email || '',
      isSignedIn: data.login !== false && !!data.id,
      isLoading: false,
    }

    console.log('✅ User state created:', userState)
    return userState.isSignedIn ? userState : null
  }
  catch (error) {
    console.error('❌ Error in getAuthStatus:', error)
    return null
  }
}

export async function requireAuth(): Promise<UserState> {
  const user = await getAuthStatus()

  if (!user || !user.isSignedIn) {
    throw new Error('認証が必要です')
  }

  return user
}

export async function checkAuth(): Promise<boolean> {
  const user = await getAuthStatus()
  return user?.isSignedIn ?? false
}
