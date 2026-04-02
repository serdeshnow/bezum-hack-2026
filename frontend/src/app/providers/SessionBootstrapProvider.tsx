import type { PropsWithChildren } from 'react'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

import { sessionService, useSessionStore } from '@/entities/session'

export function SessionBootstrapProvider({ children }: PropsWithChildren) {
  const themePreference = useSessionStore((state) => state.themePreference)
  const { setTheme } = useTheme()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    sessionService.bootstrap().finally(() => setIsReady(true))
  }, [])

  useEffect(() => {
    setTheme(themePreference)
  }, [setTheme, themePreference])

  if (!isReady) {
    return null
  }

  return children
}
