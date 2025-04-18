import { atom } from 'jotai'

interface userStateType {
  id: number
  name: string
  email: string
  isSignedIn: boolean
  isLoading: boolean
}

export const userStateAtom = atom<userStateType>({
  id: 0,
  name: '',
  email: '',
  isSignedIn: false,
  isLoading: true,
})
