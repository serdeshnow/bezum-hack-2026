import { Toaster } from 'sonner'
import { Icon } from '@/shared/ui/icon/Icon.tsx'

export function ToastProvider() {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: '#242926',
          color: '#FBFAF9',
          gap: '12px',
          borderRadius: '12px',
          fontFamily: "Inter, -apple-system, 'Segoe UI', sans-serif"
        }
      }}
      position={'top-right'}
      icons={{
        success: <Icon type='success' />,
        error: <Icon type='error' />
      }}
      duration={1000 * 4}
    />
  )
}
