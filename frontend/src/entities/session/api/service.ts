import { ThemePreference } from '@/shared/api'
import { clearStoredApiToken, getStoredApiToken, setStoredApiToken } from '@/shared/api'
import { appConfig } from '@/shared/config'
import { getSettings } from '@/shared/mocks/seamless.ts'

import { adaptBackendAuthUserToSessionUser } from '@/entities/session/api/adapters.ts'
import { getCurrentBackendUser, loginWithPassword, logoutBackend } from '@/entities/session/api/auth.ts'
import { useSessionStore } from '@/entities/session/model/session.ts'

export const sessionService = {
  getCurrentUser() {
    return useSessionStore.getState().currentUser
  },
  getStatus() {
    return useSessionStore.getState().status
  },
  async signIn(email: string, apiToken?: string, password?: string) {
    const trimmedToken = apiToken?.trim()

    if (!appConfig.useMockApi && trimmedToken) {
      const previousToken = getStoredApiToken()

      setStoredApiToken(trimmedToken)

      try {
        const backendUser = await getCurrentBackendUser()
        return useSessionStore.getState().setPendingSession(adaptBackendAuthUserToSessionUser(backendUser), trimmedToken)
      } catch (error) {
        if (previousToken) {
          setStoredApiToken(previousToken)
        } else {
          clearStoredApiToken()
        }
        throw error
      }
    }

    if (!appConfig.useMockApi && password?.trim()) {
      const result = await loginWithPassword({ email, password: password.trim() })
      return useSessionStore.getState().setPendingSession(adaptBackendAuthUserToSessionUser(result.user), result.accessToken)
    }

    return useSessionStore.getState().signIn(email, trimmedToken)
  },
  async verify() {
    const token = getStoredApiToken() || appConfig.apiToken

    if (!appConfig.useMockApi && token) {
      const backendUser = await getCurrentBackendUser()
      return useSessionStore.getState().setAuthenticatedSession(adaptBackendAuthUserToSessionUser(backendUser), token)
    }

    useSessionStore.getState().verify()
    return useSessionStore.getState().currentUser
  },
  async signOut() {
    const token = getStoredApiToken() || appConfig.apiToken

    if (!appConfig.useMockApi && token) {
      try {
        await logoutBackend()
      } catch {
        // Ignore logout transport errors; local sign-out must still complete.
      }
    }

    useSessionStore.getState().signOut()
  },
  async bootstrap() {
    const token = getStoredApiToken() || appConfig.apiToken

    if (!appConfig.useMockApi) {
      if (!token) {
        useSessionStore.getState().signOut()
        return null
      }

      try {
        const backendUser = await getCurrentBackendUser()
        return useSessionStore.getState().setAuthenticatedSession(adaptBackendAuthUserToSessionUser(backendUser), token)
      } catch {
        useSessionStore.getState().signOut()
        return null
      }
    }

    useSessionStore.getState().bootstrap()
    return useSessionStore.getState().currentUser
  },
  getSettings() {
    const userId = useSessionStore.getState().currentUser?.id ?? 'user-manager'
    return Promise.resolve(getSettings(userId))
  },
  setThemePreference(themePreference: ThemePreference) {
    useSessionStore.getState().setThemePreference(themePreference)
    return Promise.resolve(themePreference)
  }
}
