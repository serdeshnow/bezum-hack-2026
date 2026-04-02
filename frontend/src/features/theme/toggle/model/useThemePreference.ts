import { useTheme } from 'next-themes'

import { ThemePreference } from '@/shared/api'
import { sessionService, useSessionStore } from '@/entities/session'
import { useUpdateThemePreference } from '@/entities/user'

export function useThemePreference() {
  const themePreference = useSessionStore((state) => state.themePreference)
  const userId = useSessionStore((state) => state.currentUserId) ?? 'user-manager'
  const { resolvedTheme, setTheme } = useTheme()
  const updateThemePreference = useUpdateThemePreference(userId)

  const applyThemePreference = async (value: ThemePreference) => {
    await sessionService.setThemePreference(value)
    await updateThemePreference.mutateAsync(value)
    setTheme(value)
  }

  const toggleTheme = async () => {
    const nextTheme = (resolvedTheme ?? themePreference) === ThemePreference.Dark ? ThemePreference.Light : ThemePreference.Dark
    await applyThemePreference(nextTheme)
  }

  return {
    themePreference,
    isPending: updateThemePreference.isPending,
    applyThemePreference,
    toggleTheme
  }
}
