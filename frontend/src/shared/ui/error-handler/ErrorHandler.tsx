import cn from 'classnames'

import { Navigate } from 'react-router'

import { env } from '@/shared/config'

type Props = {
  error: Error
  resetErrorBoundary?: (...args: any[]) => void
}

const handleReloadPage = () => {
  window.location.reload()
}

export function ErrorHandler(props: Props) {
  const { error, resetErrorBoundary } = props

  if ((error as any)?.response?.status === 404) {
    return <Navigate to='/404' replace />
  }

  return (
    <div className='flex h-full w-full max-w-[80vw] flex-col justify-center'>
      <div className={cn('flex items-center justify-center gap-8', 'flex-col')}>
        <div className='flex flex-col gap-3'>
          <h2>Что-то пошло не так.</h2>
          <p>
            Если ошибка возникла снова, попробуйте{' '}
            <span className='accent_clickable' onClick={handleReloadPage}>
              перезагрузить страницу
            </span>
            , либо обратитесь к администратору для получения обратной связи
          </p>
          {env.__NODE_ENV__ === 'development' && (
            <>
              <ul className='list-disc pl-5 text-sm text-slate-600'>
                <li key={error.message}>{error.message}</li>
              </ul>
              <pre className='max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100'>
                {error.stack}
              </pre>
            </>
          )}
        </div>
        <div className='flex items-center justify-center gap-8'>
          <button
            type='button'
            className='cursor-pointer rounded-xl border-0 bg-brand-500 px-[18px] py-[14px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-brand-500'
            onClick={resetErrorBoundary}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </div>
  )
}
