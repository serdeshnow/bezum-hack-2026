import { createMemoryRouter, RouterProvider } from 'react-router'
import { render, screen } from '@testing-library/react'

import { GuestRoute } from '../../src/app/router/GuestRoute'
import { ProtectedRoute } from '../../src/app/router/ProtectedRoute'
import { useSessionStore } from '../../src/entities/session'

describe('route guards', () => {
  it('redirects anonymous users away from protected routes', async () => {
    useSessionStore.getState().signOut()

    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: (
            <ProtectedRoute>
              <div>Private area</div>
            </ProtectedRoute>
          )
        },
        {
          path: '/auth/sign-in',
          element: <div>Sign in page</div>
        }
      ],
      { initialEntries: ['/'] }
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Sign in page')).toBeInTheDocument()
  })

  it('redirects authenticated users away from guest routes', async () => {
    useSessionStore.getState().signIn('sarah@seamless.dev')

    const router = createMemoryRouter(
      [
        {
          path: '/auth/sign-in',
          element: (
            <GuestRoute>
              <div>Guest area</div>
            </GuestRoute>
          )
        },
        {
          path: '/projects',
          element: <div>Projects area</div>
        }
      ],
      { initialEntries: ['/auth/sign-in'] }
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('Projects area')).toBeInTheDocument()
  })
})
