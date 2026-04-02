import type { ReactNode } from 'react'

import cn from 'classnames'

type BadgeVariant = 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'muted'

type BadgeProps = {
  children: ReactNode
  className?: string
  variant?: BadgeVariant
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variantClass =
    variant === 'outline'
      ? 'border-[color:var(--border)] bg-[color:var(--background-elevated)] text-[color:var(--foreground)]'
      : variant === 'success'
        ? 'border-[color:var(--success)] bg-[color:var(--success-soft)] text-[color:var(--success)]'
        : variant === 'warning'
          ? 'border-[color:var(--warning)] bg-[color:var(--warning-soft)] text-[color:var(--warning)]'
          : variant === 'danger'
            ? 'border-[color:var(--danger)] bg-[color:var(--danger-soft)] text-[color:var(--danger)]'
            : variant === 'muted'
              ? 'border-[color:var(--border)] bg-[color:var(--secondary)] text-[color:var(--muted-foreground)]'
              : 'border-[color:var(--accent)] bg-[color:var(--accent)] text-[color:var(--accent-foreground)]'

  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center rounded-xl border px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]',
        variantClass,
        className
      )}
    >
      {children}
    </span>
  )
}
