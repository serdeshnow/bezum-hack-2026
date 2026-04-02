import { useTheme } from 'next-themes'

import { ThemePreference } from '@/shared/api'
import { sessionService, useSessionStore } from '@/entities/session'

export function useThemePreference() {
  const themePreference = useSessionStore((state) => state.themePreference)
  const { resolvedTheme, setTheme } = useTheme()

  const applyThemePreference = async (value: ThemePreference) => {
    await sessionService.setThemePreference(value)
    setTheme(value)
  }

  const toggleTheme = async () => {
    const nextTheme = (resolvedTheme ?? themePreference) === ThemePreference.Dark ? ThemePreference.Light : ThemePreference.Dark
    await applyThemePreference(nextTheme)
  }

  return {
    themePreference,
    applyThemePreference,
    toggleTheme
  }
}
