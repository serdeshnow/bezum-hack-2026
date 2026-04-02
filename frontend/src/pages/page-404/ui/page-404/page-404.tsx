import { Link } from 'react-router'

import { ErrorBoundary } from 'react-error-boundary'
import { ErrorHandler, logError } from '@/shared/ui'

import { corePathKeys } from '@/shared/model'

export function Page404() {
  return (
    <ErrorBoundary FallbackComponent={ErrorHandler} onError={logError}>
      <BasePage404 />
    </ErrorBoundary>
  )
}

function BasePage404() {
  return (
    <div className='flex min-h-screen w-full flex-col items-center justify-center'>
      <div className='flex flex-col gap-3'>
        <h1 className='text-4xl font-semibold tracking-tight text-slate-900'>404: Page not found</h1>
        <p>The requested route does not exist in the current Seamless workspace.</p>
        <Link to={corePathKeys.home} className='accent_clickable' data-test='go-home-link'>
          Go back to projects
        </Link>
      </div>
    </div>
  )
}
