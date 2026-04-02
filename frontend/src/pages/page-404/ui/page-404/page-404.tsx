import { Link } from 'react-router'

import { appRoutes } from '@/shared/model'

export function Page404() {
  return (
    <div className='flex min-h-screen items-center justify-center px-6 py-12'>
      <div className='space-y-3 text-center'>
        <h1 className='text-4xl font-semibold tracking-tight'>404: Page not found</h1>
        <p className='text-muted-foreground'>The requested route does not exist in the current workspace.</p>
        <Link to={appRoutes.projects} className='text-primary underline-offset-4 hover:underline'>
          Go back to projects
        </Link>
      </div>
    </div>
  )
}
