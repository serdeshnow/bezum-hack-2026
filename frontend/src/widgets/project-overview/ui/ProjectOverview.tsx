import { Link } from 'react-router'

import { Badge, Card } from '@/shared/ui'
import type { ProjectOverviewData } from '@/widgets/project-overview/model/projectOverview.ts'

type ProjectOverviewProps = {
  data: ProjectOverviewData
}

export function ProjectOverview({ data }: ProjectOverviewProps) {
  return (
    <div className='grid gap-6'>
      <Card className='bg-[linear-gradient(135deg,rgba(247,245,241,0.96)_0%,rgba(234,232,227,0.98)_58%,rgba(219,232,230,0.52)_100%)]' theme='secondary'>
        <div className='grid gap-5'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div className='grid gap-2'>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted-foreground)]'>{data.key}</p>
                <Badge variant={data.status === 'active' ? 'success' : data.status === 'at-risk' ? 'warning' : 'muted'}>{data.status}</Badge>
                <Badge variant='outline'>{data.visibilityMode}</Badge>
              </div>
              <div>
                <h1 className='font-heading text-5xl uppercase leading-[0.96] tracking-[0.03em] text-[color:var(--foreground)]'>{data.name}</h1>
                <p className='mt-3 max-w-[76ch] text-sm leading-6 text-[color:var(--muted-foreground)]'>{data.description}</p>
              </div>
            </div>

            <div className='grid gap-2 sm:grid-cols-2'>
              <Link
                className='ui-btn ui-btn-primary'
                to='/docs'
              >
                Create Doc
              </Link>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/tasks'
              >
                Create Task
              </Link>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/meetings'
              >
                Schedule Meeting
              </Link>
              <Link
                className='ui-btn ui-btn-secondary'
                to='/releases'
              >
                Open Delivery
              </Link>
            </div>
          </div>

          <div className='rounded-[28px] border border-[color:var(--warning)] bg-[color:var(--warning-soft)] px-4 py-4 text-sm leading-6 text-[color:var(--foreground)]'>
            Customer-safe mode would currently hide {data.customerHiddenEntities} internal entities from a customer-visible workspace view.
          </div>
        </div>
      </Card>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5'>
        {data.summary.map((item) => (
          <Card key={item.id} className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
            <div className='grid gap-2'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{item.label}</p>
              <div className='flex flex-wrap items-center gap-2'>
                <p className='font-heading text-4xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{item.value}</p>
                <Badge variant={item.tone === 'success' ? 'success' : item.tone === 'warning' ? 'warning' : item.tone === 'danger' ? 'danger' : 'outline'}>
                  {item.tone}
                </Badge>
              </div>
              <p className='text-sm leading-6 text-[color:var(--muted-foreground)]'>{item.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <div className='grid gap-6 2xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]'>
        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Entity Graph</p>
              <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Linked product context</h2>
            </div>
            <div className='grid gap-4 md:grid-cols-2 2xl:grid-cols-3'>
              {data.entities.map((entity) => (
                <div key={entity.id} className='rounded-[28px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] p-4'>
                  <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>{entity.label}</p>
                  <p className='font-heading mt-2 text-4xl uppercase leading-[1.02] text-[color:var(--foreground)]'>{entity.count}</p>
                  <p className='mt-2 text-sm leading-6 text-[color:var(--muted-foreground)]'>{entity.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className='bg-[linear-gradient(180deg,rgba(247,245,241,0.94)_0%,rgba(234,232,227,0.98)_100%)]' theme='secondary'>
          <div className='grid gap-4'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted-foreground)]'>Activity Feed</p>
              <h2 className='font-heading mt-1 text-3xl uppercase leading-[1.02] text-[color:var(--foreground)]'>Latest project movement</h2>
            </div>
            <div className='grid gap-3'>
              {data.activity.map((entry) => (
                <div key={entry.id} className='rounded-[24px] border border-[color:var(--border)] bg-[color:var(--background-elevated)] px-4 py-4'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <p className='font-medium text-[color:var(--foreground)]'>{entry.title}</p>
                    <Badge variant='outline'>{entry.type}</Badge>
                  </div>
                  <p className='mt-1 text-sm text-[color:var(--muted-foreground)]'>{entry.detail}</p>
                  <div className='mt-3 flex items-center justify-between gap-4 text-sm text-[color:var(--muted-foreground)]'>
                    <span>{entry.actor}</span>
                    <span>{entry.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
