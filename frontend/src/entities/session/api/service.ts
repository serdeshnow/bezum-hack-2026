import { ThemePreference } from '@/shared/api'
import { getSettings } from '@/shared/mocks/seamless.ts'

import { useSessionStore } from '@/entities/session/model/session.ts'

export const sessionService = {
  getCurrentUser() {
    return useSessionStore.getState().currentUser
  },
  getStatus() {
    return useSessionStore.getState().status
  },
  signIn(email: string) {
    return Promise.resolve(useSessionStore.getState().signIn(email))
  },
  verify() {
    useSessionStore.getState().verify()
    return Promise.resolve(useSessionStore.getState().currentUser)
  },
  signOut() {
    useSessionStore.getState().signOut()
    return Promise.resolve()
  },
  bootstrap() {
    useSessionStore.getState().bootstrap()
    return Promise.resolve(useSessionStore.getState().currentUser)
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
