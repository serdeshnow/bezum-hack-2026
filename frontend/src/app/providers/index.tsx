import { ErrorBoundaryProvider } from './ErrorBoundaryProvider.tsx'
import { QueryClientProvider } from './QueryClientProvider.tsx'
import { ThemeProvider } from './ThemeProvider.tsx'
import { AppRouterProvider } from './AppRouterProvider.tsx'
import { SessionBootstrapProvider } from './SessionBootstrapProvider.tsx'
import { AppToaster } from '@/shared/ui/sonner/AppToaster.tsx'

export const Providers = () => {
  return (
    <ErrorBoundaryProvider>
      <QueryClientProvider>
        <ThemeProvider>
          <SessionBootstrapProvider>
            <AppRouterProvider />
            <AppToaster />
          </SessionBootstrapProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundaryProvider>
  )
}
