import type { PropsWithChildren } from 'react'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'

import { useSessionStore } from '@/entities/session'

export function SessionBootstrapProvider({ children }: PropsWithChildren) {
  const bootstrap = useSessionStore((state) => state.bootstrap)
  const themePreference = useSessionStore((state) => state.themePreference)
  const { setTheme } = useTheme()

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    setTheme(themePreference)
  }, [setTheme, themePreference])

  return children
}
