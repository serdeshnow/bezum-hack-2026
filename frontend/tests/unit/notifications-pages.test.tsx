import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'

import { UnifiedInboxPage } from '../../src/pages/unified-inbox/UnifiedInboxPage'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
}

describe('notification routes', () => {
  it('renders the unified inbox with live notification data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UnifiedInboxPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Unified Inbox' })).toBeInTheDocument()
    expect(await screen.findByText('Document approval waiting on customer sign-off')).toBeInTheDocument()
  })
})
