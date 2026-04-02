import { LoaderCircle } from 'lucide-react'

export function Spinner() {
  return (
    <div className='inline-flex min-h-12 min-w-12 items-center justify-center' aria-label='Loading' role='status'>
      <LoaderCircle className='size-8 animate-spin' />
    </div>
  )
}
