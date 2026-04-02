import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

type Props = ComponentProps<'div'> & {
  value: number
}

export function Progress({ className, value, ...props }: Props) {
  return (
    <div className={cn('bg-muted relative h-2 w-full overflow-hidden rounded-full', className)} {...props}>
      <div className='bg-accent h-full transition-all' style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}
