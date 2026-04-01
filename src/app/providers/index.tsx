import { ErrorBoundaryProvider } from './ErrorBoundaryProvider.tsx'
import { QueryClientProvider } from './QueryClientProvider'
import { RouterProvider } from './RouterProvider'
import { ToastProvider } from './ToastProvider'

export const Providers = () => {
  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider>
          <RouterProvider />
          <ToastProvider />
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  )
}
