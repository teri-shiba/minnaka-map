'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(body: { email: string, password: string }) {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/sign_in`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('ログインに失敗しました')
    }
    revalidatePath('/')
    return await response.json()
  }
  catch (error) {
    console.error('API Error:', error)
  }
}

export async function logoutAction() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/sign_out`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      console.error('Rails logout failed:', response.status)
    }

    revalidatePath('/')
  }
  catch (error) {
    console.error('Logout API error:', error)
  }
  redirect('/')
}
