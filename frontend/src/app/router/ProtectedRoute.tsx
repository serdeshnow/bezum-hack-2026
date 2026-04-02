import type { PropsWithChildren } from 'react'

import { Navigate, useLocation } from 'react-router'

import { isAuthenticated } from '@/entities/session'
import { appRoutes } from '@/shared/model'

export function ProtectedRoute({ children }: PropsWithChildren) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to={appRoutes.auth.signIn} replace state={{ from: location.pathname }} />
  }

  return children
}
