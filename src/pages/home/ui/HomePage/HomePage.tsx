import { Link } from 'react-router'

import { templateConfig } from '@/shared/config'
import { corePathKeys } from '@/shared/model'

export function HomePage() {
  return (
    <section className='grid gap-6'>
      <div className='grid gap-3'>
        <p className='m-0 text-sm uppercase tracking-[0.08em] text-slate-500'>Starter</p>
        <h1 className='m-0 text-4xl font-bold tracking-tight text-slate-950'>{templateConfig.appName}</h1>
        <p className='m-0 max-w-[62ch] text-lg text-slate-600'>
          This generic application shell is clean, wired, and ready for project-specific routes and features.
        </p>
      </div>

      <div className='grid gap-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
        <h2 className='m-0 text-xl font-semibold text-slate-950'>Feature flags</h2>
        <p className='m-0 text-slate-600'>
          `VITE_FEATURE_AUTH` adds auth placeholders, and `VITE_FEATURE_EXAMPLES` enables example-pack placeholder routes.
        </p>
        <div className='flex flex-wrap gap-3'>
          <Link className='rounded-full bg-slate-950 px-4 py-2 font-semibold text-slate-50 no-underline' to={corePathKeys.home}>
            Stay on home
          </Link>
          <Link
            className='rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-900 no-underline'
            to={corePathKeys.notFound}
          >
            Open 404
          </Link>
        </div>
      </div>
    </section>
  )
}
