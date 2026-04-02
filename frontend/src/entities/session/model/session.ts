import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ThemePreference } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { getUserById, signInByEmail, type UserSummary } from '@/shared/mocks/seamless.ts'

type SessionStatus = 'authenticated' | 'anonymous'

type SessionState = {
  status: SessionStatus
  currentUser: UserSummary | null
  themePreference: ThemePreference
  currentProjectId: string
  signIn: (email: string) => UserSummary
  verify: () => void
  signOut: () => void
  setThemePreference: (themePreference: ThemePreference) => void
  setCurrentProjectId: (projectId: string) => void
  bootstrap: () => void
}

const initialUser = getUserById(appConfig.sessionUserId)

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      status: 'authenticated',
      currentUser: initialUser,
      themePreference: ThemePreference.System,
      currentProjectId: appConfig.defaultProjectId,
      signIn: (email) => {
        const user = signInByEmail(email)
        set({ currentUser: user, status: 'authenticated' })
        return user
      },
      verify: () => {
        set((state) => ({ ...state, status: state.currentUser ? 'authenticated' : 'anonymous' }))
      },
      signOut: () => {
        set({ currentUser: null, status: 'anonymous' })
      },
      setThemePreference: (themePreference) => {
        set({ themePreference })
      },
      setCurrentProjectId: (currentProjectId) => {
        set({ currentProjectId })
      },
      bootstrap: () => {
        set((state) =>
          state.currentUser
            ? state
            : {
                ...state,
                currentUser: initialUser,
                status: 'authenticated'
              }
        )
      }
    }),
    {
      name: 'seamless-session'
    }
  )
)
