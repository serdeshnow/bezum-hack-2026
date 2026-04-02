import type { PropsWithChildren } from 'react'

import { Navigate } from 'react-router'

import { isAuthenticated } from '@/entities/session'
import { appRoutes } from '@/shared/model'

export function GuestRoute({ children }: PropsWithChildren) {
  if (isAuthenticated()) {
    return <Navigate to={appRoutes.projects} replace />
  }

  return children
}
