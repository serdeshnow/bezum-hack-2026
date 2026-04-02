import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

function Skeleton({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('bg-accent animate-pulse rounded-md', className)} {...props} />
}

export { Skeleton }
