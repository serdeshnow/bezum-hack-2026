import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'

import { ReleaseDashboardPage } from '../../src/pages/release-dashboard/ReleaseDashboardPage'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
}

describe('delivery routes', () => {
  it('renders the release dashboard with live release data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ReleaseDashboardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Releases and Pull Requests' })).toBeInTheDocument()
    expect(await screen.findByText(/v2.1.0/i)).toBeInTheDocument()
  })
})
