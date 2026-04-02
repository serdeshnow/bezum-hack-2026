import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { ThemePreference, WorkspaceRole } from '@/shared/api'
import { clearStoredApiToken, setStoredApiToken } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { getSettings, getUserById, signInByEmail } from '@/shared/mocks/seamless.ts'

import { adaptThemePreference, adaptUserSummaryToUser, adaptUserToSessionUser } from '@/entities/session/api/adapters.ts'
import type { SessionUser } from '@/entities/session/model/types.ts'

export type SessionStatus = 'anonymous' | 'pending-verification' | 'authenticated'

type SessionState = {
  status: SessionStatus
  currentUserId: string | null
  pendingUserId: string | null
  currentUser: SessionUser | null
  role: WorkspaceRole | null
  apiToken: string | null
  themePreference: ThemePreference
  isAuthenticated: boolean
  currentProjectId: string
  signIn: (email: string, apiToken?: string) => SessionUser
  verify: () => SessionUser | null
  signOut: () => void
  setThemePreference: (themePreference: ThemePreference) => void
  setCurrentProjectId: (projectId: string) => void
  bootstrap: () => void
}

const storageKey = 'seamless-session'

function resolveThemePreference(userId: string | null) {
  if (!userId) return ThemePreference.System
  return adaptThemePreference(getSettings(userId), ThemePreference.System)
}

function createSessionSnapshot(
  user: SessionUser | null,
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
    apiToken: appConfig.apiToken || null,
    themePreference: resolveThemePreference(user?.id ?? null),
    isAuthenticated: status === 'authenticated',
    currentProjectId
  }
}

const initialUser = getUserById(appConfig.sessionUserId)
const initialSessionUser = adaptUserToSessionUser(adaptUserSummaryToUser(initialUser), initialUser.id)

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      ...createSessionSnapshot(initialSessionUser, 'authenticated', appConfig.defaultProjectId),
      signIn: (email, apiToken) => {
        const summary = signInByEmail(email)
        const user = adaptUserToSessionUser(adaptUserSummaryToUser(summary), summary.id)
        if (apiToken?.trim()) {
          setStoredApiToken(apiToken.trim())
        }
        set((state) => ({
          ...createSessionSnapshot(user, 'pending-verification', state.currentProjectId, user.id),
          apiToken: apiToken?.trim() || state.apiToken || appConfig.apiToken || null
        }))
        return user
      },
      verify: () => {
        let verifiedUser: SessionUser | null = null
        set((state) => {
          verifiedUser = state.currentUser

          return state.currentUser
            ? createSessionSnapshot(state.currentUser, 'authenticated', state.currentProjectId)
            : createSessionSnapshot(null, 'anonymous', state.currentProjectId)
        })

        return verifiedUser
      },
      signOut: () => {
        clearStoredApiToken()
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
            const summary = getUserById(state.currentUserId)
            const user = adaptUserToSessionUser(adaptUserSummaryToUser(summary), summary.id)
            return {
              ...state,
              currentUser: user,
              role: user.role,
              apiToken: state.apiToken || appConfig.apiToken || null,
              themePreference: resolveThemePreference(user.id),
              isAuthenticated: state.status === 'authenticated'
            }
          }

          if (state.pendingUserId) {
            const summary = getUserById(state.pendingUserId)
            const user = adaptUserToSessionUser(adaptUserSummaryToUser(summary), summary.id)
            return {
              ...state,
              status: 'pending-verification',
              currentUserId: user.id,
              currentUser: user,
              role: user.role,
              apiToken: state.apiToken || appConfig.apiToken || null,
              themePreference: resolveThemePreference(user.id),
              isAuthenticated: false
            }
          }

          return {
            ...createSessionSnapshot(initialSessionUser, 'authenticated', state.currentProjectId),
            apiToken: state.apiToken || appConfig.apiToken || null
          }
        })
      }
    }),
    {
      name: storageKey
    }
  )
)
