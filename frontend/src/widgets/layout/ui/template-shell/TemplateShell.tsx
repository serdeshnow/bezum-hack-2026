import cn from 'classnames'

import { NavLink, Outlet } from 'react-router'

import { templateConfig } from '@/shared/config'
import { corePathKeys } from '@/shared/model/coreRouter.ts'

function NavigationLink({ label, to }: { label: string; to: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'inline-flex min-h-10 items-center justify-center rounded-full px-3.5 text-slate-900 no-underline transition-colors hover:bg-slate-900 hover:text-slate-50',
          { 'bg-slate-900 text-slate-50': isActive }
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function TemplateShell() {
  return (
    <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_30%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)] text-slate-900'>
      <header className='sticky top-0 z-10 border-b border-slate-900/8 bg-slate-50/90 backdrop-blur-xl'>
        <div className='mx-auto flex min-h-[72px] w-[min(1120px,calc(100vw-32px))] items-center justify-between gap-4'>
          <div className='grid gap-1'>
            <p className='m-0 text-xs uppercase tracking-[0.08em] text-slate-500'>Reusable Frontend Starter</p>
            <p className='m-0 text-lg font-bold'>{templateConfig.appName}</p>
          </div>
          <nav className='flex flex-wrap gap-3' aria-label='Primary'>
            <NavigationLink label='Home' to={corePathKeys.home} />
            {templateConfig.features.examples && (
              <NavigationLink label='Example Pack' to={corePathKeys.examples.grassAdmin} />
            )}
            {templateConfig.features.auth && !templateConfig.features.examples && (
              <NavigationLink label='Auth Placeholder' to={corePathKeys.auth.signIn} />
            )}
          </nav>
        </div>
      </header>

      <main className='mx-auto w-[min(1120px,calc(100vw-32px))] py-8 pb-12'>
        <Outlet />
      </main>
    </div>
  )
}
