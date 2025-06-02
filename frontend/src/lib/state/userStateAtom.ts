import type { UserState } from '~/types/user'
import { atom } from 'jotai'

export const initialUserState: UserState = {
  id: 0,
  name: '',
  email: '',
  isSignedIn: false,
  isLoading: true,
}

export const userStateAtom = atom<UserState>(initialUserState)

export const isSignedInAtom = atom(get => get(userStateAtom).isSignedIn)
export const isLoadingAtom = atom(get => get(userStateAtom).isLoading)
export const userNameAtom = atom(get => get(userStateAtom).name)
