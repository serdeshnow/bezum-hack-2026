import type { ComponentProps } from 'react'

import { cn } from '@/shared/lib'

function Card({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('bg-card text-card-foreground flex flex-col gap-4 rounded-xl border shadow-sm', className)} {...props} />
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('grid auto-rows-min items-start gap-1.5 px-6 pt-6', className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return <h3 className={cn('leading-none font-semibold', className)} {...props} />
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return <p className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('self-start justify-self-end', className)} {...props} />
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-6 [&:last-child]:pb-6', className)} {...props} />
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex items-center px-6 pb-6', className)} {...props} />
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent }
