import { Card } from '@/shared/ui/card/Card.tsx'

type StagePageProps = {
  eyebrow: string
  title: string
  description: string
  highlights: string[]
  nextMoves: string[]
}

export function StagePage({ eyebrow, title, description, highlights, nextMoves }: StagePageProps) {
  return (
    <section className='grid gap-6'>
      <Card className='border-slate-300/70 bg-white shadow-sm' theme='secondary'>
        <div className='grid gap-4'>
          <div className='grid gap-2'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>{eyebrow}</p>
            <h1 className='text-3xl font-semibold tracking-tight text-slate-950'>{title}</h1>
            <p className='max-w-[72ch] text-base leading-7 text-slate-600'>{description}</p>
          </div>

          <div className='grid gap-3 md:grid-cols-2'>
            <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
              <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-slate-500'>What this route owns</h2>
              <ul className='mt-4 grid gap-3'>
                {highlights.map((item) => (
                  <li key={item} className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className='rounded-3xl border border-slate-200 bg-slate-50 p-5'>
              <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-slate-500'>Next implementation moves</h2>
              <ul className='mt-4 grid gap-3'>
                {nextMoves.map((item) => (
                  <li key={item} className='rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700'>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
