import { RouterProvider } from 'react-router'

import { router } from '@/app/router/router.tsx'

export function AppRouterProvider() {
  return <RouterProvider router={router} />
}
