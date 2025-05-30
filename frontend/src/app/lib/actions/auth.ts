'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  try {
    const cookieStore = await cookies()

    const authCookies = {
      'access-token': cookieStore.get('access-token')?.value,
      'client': cookieStore.get('client')?.value,
      'uid': cookieStore.get('uid')?.value,
    }

    if (authCookies['access-token'] && authCookies.client && authCookies.uid) {
      try {
        const response = await fetch(`${process.env.API_BASE_URL}/auth/sign_out`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'access-token': authCookies['access-token'],
            'client': authCookies.client,
            'uid': authCookies.uid,
          },
        })

        if (!response.ok) {
          console.error('Rails logout failed:', response.status)
        }
      }
      catch (error) {
        console.error('Logout API error:', error)
      }
    }

    cookieStore.delete('access-token')
    cookieStore.delete('client')
    cookieStore.delete('uid')

    revalidatePath('/', 'layout')
  }
  catch (error) {
    console.error('logout API error', error)
  }

  redirect('/')
}
