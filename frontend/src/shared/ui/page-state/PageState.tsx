import type { ReactNode } from 'react'

import { AlertCircle, Inbox, SearchX } from 'lucide-react'

import { Button } from '@/shared/ui/button/Button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card/Card.tsx'
import { Spinner } from '@/shared/ui/spinner/Spinner.tsx'

type PageStateType = 'loading' | 'empty' | 'error'

type Props = {
  state: PageStateType
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

const iconMap = {
  loading: <Spinner />,
  empty: <Inbox className='size-10 text-muted-foreground' />,
  error: <AlertCircle className='size-10 text-destructive' />
} as const

export function PageState({ state, title, description, action, children }: Props) {
  return (
    <Card className='mx-auto max-w-2xl'>
      <CardHeader className='items-center text-center'>
        <div className='rounded-full bg-muted p-4'>{state === 'empty' && !children ? <SearchX className='size-10 text-muted-foreground' /> : iconMap[state]}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {(action || children) && (
        <CardContent className='flex flex-col items-center gap-4'>
          {children}
          {action && <Button onClick={action.onClick}>{action.label}</Button>}
        </CardContent>
      )}
    </Card>
  )
}
