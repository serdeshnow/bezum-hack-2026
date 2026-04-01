import { ErrorBoundaryProvider } from './ErrorBoundaryProvider.tsx'
import { QueryClientProvider } from './QueryClientProvider.tsx'
import { RouterProvider } from './RouterProvider.tsx'
import { ToastProvider } from './ToastProvider.tsx'

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
