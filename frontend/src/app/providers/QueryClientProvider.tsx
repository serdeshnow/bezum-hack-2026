import type { PropsWithChildren } from 'react'

import { Suspense, lazy } from 'react'
import { QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query'

import { queryClient } from '@/shared/api/queryClient.ts'

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools
      }))
    )
  : null

export function QueryClientProvider({ children }: PropsWithChildren) {
  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-right' />
        </Suspense>
      )}
    </TanStackQueryClientProvider>
  )
}
