import cn from 'classnames'

type ProgressProps = {
  value: number
  className?: string
  indicatorClassName?: string
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value))

  return (
    <div className={cn('h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--secondary)]', className)}>
      <div
        className={cn('h-full rounded-full bg-[color:var(--accent)] transition-[width] duration-300', indicatorClassName)}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}
