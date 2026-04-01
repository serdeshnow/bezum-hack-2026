export function Spinner() {
  return (
    <div className='inline-flex min-h-12 min-w-12 items-center justify-center' aria-label='Загрузка' role='status'>
      <svg className='h-12 w-12 animate-spin' viewBox='0 0 50 50' aria-hidden='true'>
        <circle className='fill-none stroke-slate-200' cx='25' cy='25' r='20' strokeWidth='4' />
        <circle
          className='fill-none stroke-brand-500'
          cx='25'
          cy='25'
          r='20'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray='90'
          strokeDashoffset='60'
        />
      </svg>
    </div>
  )
}
