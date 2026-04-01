import { type CSSProperties, type PropsWithChildren } from 'react'
import cn from 'classnames'

type Props = PropsWithChildren & { className?: string } & {
  variant?: 'circular' | 'rectangular' | 'rounded' | 'text' | 'input' | 'btn' // bad variant, delete
  width?: number | string
  height?: number | string
  animation?: 'pulse' | 'wave'
  style?: CSSProperties
}

export function Skeleton(props: Props) {
  const { variant = 'text', width = 128, height = 20, animation = 'wave', style, className, children } = props

  const variantClass =
    variant === 'rectangular'
      ? 'rounded-none'
      : variant === 'rounded'
        ? 'rounded-2xl'
        : variant === 'circular'
          ? 'rounded-full'
          : variant === 'input'
            ? '!mb-6 !h-14 !w-full rounded-lg'
            : variant === 'btn'
              ? '!h-8 !w-32 rounded-lg'
              : 'rounded-md'

  const animationClass =
    animation === 'pulse'
      ? 'animate-pulse'
      : "relative overflow-hidden before:absolute before:inset-y-0 before:left-[-150%] before:w-[150%] before:bg-linear-to-r before:from-transparent before:via-white/30 before:to-transparent before:content-[''] before:animate-[ui-skeleton-wave_1.6s_infinite]"

  const st = {
    width: isNumber(width) ? `${width}px` : width,
    height: isNumber(height) ? `${height}px` : height,
    ...style
  }

  return (
    <div className={cn('inline-block bg-slate-200', variantClass, animationClass)} style={st}>
      {children && <div className={className}>{children}</div>}
    </div>
  )
}

function isNumber(value: string | number): value is number {
  return typeof value === 'number'
}
