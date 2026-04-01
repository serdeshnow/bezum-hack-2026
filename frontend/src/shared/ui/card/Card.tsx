import { createContext, type HTMLAttributes, type PropsWithChildren, type Ref, useContext } from 'react'

import cn from 'classnames'

import { ErrorBoundary } from 'react-error-boundary'
import { ErrorHandler } from '@/shared/ui/error-handler/ErrorHandler.tsx'
import { logError } from '@/shared/ui/error-handler/logError.ts'

export type CardSize = 'none' | 'xs' | 'sm' | 'lg' // looks wierd I know

export type CardTheme = 'primary' | 'secondary' | 'default'

type CardContext = {
  size?: CardSize
  theme?: CardTheme
}

const CardContext = createContext<CardContext | undefined>(undefined)

function useCardContext() {
  const context = useContext(CardContext)
  if (!context) {
    throw new Error('useCardContext must be used within a Card')
  }
  return context
}

type Props = CardContext &
  PropsWithChildren &
  HTMLAttributes<HTMLDivElement> & {
    className?: string
    ref?: Ref<HTMLDivElement>
  }

export function Card(props: Props) {
  const { size = 'lg', theme = 'primary' } = props

  return (
    <ErrorBoundary FallbackComponent={ErrorHandler} onError={logError}>
      <CardContext.Provider value={{ size, theme }}>
        <BaseCard {...props} />
      </CardContext.Provider>
    </ErrorBoundary>
  )
}

function BaseCard(props: Props) {
  const { className, size = 'lg', theme = 'primary', children, ...rest } = props
  const sizeClass =
    size === 'none' ? 'p-0' : size === 'xs' ? 'p-3 xl:p-2' : size === 'sm' ? 'p-5 xl:p-3' : 'p-6 xl:p-4'
  const themeClass =
    theme === 'secondary'
      ? 'border border-slate-200 bg-white'
      : theme === 'default'
        ? 'border border-transparent bg-transparent'
        : 'border border-slate-200 bg-slate-50'

  return (
    <div className={cn('w-full rounded-2xl box-border', sizeClass, themeClass, className)} {...rest}>
      {children}
    </div>
  )
}

type PropsWithChildrenAndClassname = PropsWithChildren & {
  className?: string
}

Card.Header = function CardHeader({ className, children }: PropsWithChildrenAndClassname) {
  const { size: ctxSize } = useCardContext()
  const sizeClass = ctxSize === 'sm' ? 'pb-1 mb-1' : 'min-h-[50px] pb-4 mb-4'

  return <div className={cn('flex flex-row justify-between gap-4 border-b border-slate-200', sizeClass, className)}>{children}</div>
}

Card.Title = function CardTitle({ className, children }: PropsWithChildrenAndClassname) {
  const { size: ctxSize } = useCardContext()
  const sizeClass = ctxSize === 'sm' ? 'text-base leading-6' : 'text-lg leading-7'

  return <h3 className={cn('cursor-default font-semibold text-slate-900', sizeClass, className)}>{children}</h3>
}

Card.Container = function CardContainer({ className, children }: PropsWithChildrenAndClassname) {
  return <div className={cn('flex flex-col', className)}>{children}</div>
}
