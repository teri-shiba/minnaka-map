import type { UserState } from '~/types/user'
import { atomWithReset } from 'jotai/utils'

export const initialUserState: UserState = {
  id: 0,
  name: '',
  email: '',
  provider: '',
  isSignedIn: false,
}

export const userStateAtom = atomWithReset<UserState>(initialUserState)
