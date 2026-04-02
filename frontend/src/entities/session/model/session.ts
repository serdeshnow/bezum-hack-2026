import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ThemePreference, WorkspaceRole } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { getSettings, getUserById, signInByEmail, type UserSummary } from '@/shared/mocks/seamless.ts'

export type SessionStatus = 'anonymous' | 'pending-verification' | 'authenticated'

type SessionState = {
  status: SessionStatus
  currentUserId: string | null
  pendingUserId: string | null
  currentUser: UserSummary | null
  role: WorkspaceRole | null
  themePreference: ThemePreference
  isAuthenticated: boolean
  currentProjectId: string
  signIn: (email: string) => UserSummary
  verify: () => UserSummary | null
  signOut: () => void
  setThemePreference: (themePreference: ThemePreference) => void
  setCurrentProjectId: (projectId: string) => void
  bootstrap: () => void
}

const storageKey = 'seamless-session'

function resolveThemePreference(userId: string | null) {
  if (!userId) return ThemePreference.System
  return getSettings(userId).appearance.theme
}

function createSessionSnapshot(
  user: UserSummary | null,
  status: SessionStatus,
  currentProjectId: string,
  pendingUserId: string | null = null
) {
  return {
    status,
    currentUserId: user?.id ?? null,
    pendingUserId,
    currentUser: user,
    role: user?.role ?? null,
    themePreference: resolveThemePreference(user?.id ?? null),
    isAuthenticated: status === 'authenticated',
    currentProjectId
  }
}

const initialUser = getUserById(appConfig.sessionUserId)

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...createSessionSnapshot(initialUser, 'authenticated', appConfig.defaultProjectId),
      signIn: (email) => {
        const user = signInByEmail(email)
        set((state) => createSessionSnapshot(user, 'pending-verification', state.currentProjectId, user.id))
        return user
      },
      verify: () => {
        let verifiedUser: UserSummary | null = null
        set((state) => {
          verifiedUser = state.currentUser

          return state.currentUser
            ? createSessionSnapshot(state.currentUser, 'authenticated', state.currentProjectId)
            : createSessionSnapshot(null, 'anonymous', state.currentProjectId)
        })

        return verifiedUser
      },
      signOut: () => {
        set((state) => createSessionSnapshot(null, 'anonymous', state.currentProjectId))
      },
      setThemePreference: (themePreference) => {
        set({ themePreference })
      },
      setCurrentProjectId: (currentProjectId) => {
        set({ currentProjectId })
      },
      bootstrap: () => {
        set((state) => {
          if (state.currentUserId) {
            const user = getUserById(state.currentUserId)
            return {
              ...state,
              currentUser: user,
              role: user.role,
              themePreference: resolveThemePreference(user.id),
              isAuthenticated: state.status === 'authenticated'
            }
          }

          if (state.pendingUserId) {
            const user = getUserById(state.pendingUserId)
            return {
              ...state,
              status: 'pending-verification',
              currentUserId: user.id,
              currentUser: user,
              role: user.role,
              themePreference: resolveThemePreference(user.id),
              isAuthenticated: false
            }
          }

          return createSessionSnapshot(initialUser, 'authenticated', state.currentProjectId)
        })
      }
    }),
    {
      name: storageKey
    }
  )
)
