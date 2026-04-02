import type { PropsWithChildren } from 'react'

import { ErrorBoundary } from 'react-error-boundary'
import { ErrorHandler } from '@/shared/ui/error-handler/ErrorHandler.tsx'
import { logError } from '@/shared/ui/error-handler/logError.ts'

export function ErrorBoundaryProvider({ children }: PropsWithChildren) {
  return (
    <ErrorBoundary FallbackComponent={ErrorHandler} onError={logError}>
      {children}
    </ErrorBoundary>
  )
}
