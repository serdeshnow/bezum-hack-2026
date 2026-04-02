import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'

import { ProjectsListPage } from '../../src/pages/projects/ProjectsListPage'

describe('ProjectsListPage', () => {
  it('renders the product landing route messaging', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false
        }
      }
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProjectsListPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Projects Hub' })).toBeInTheDocument()
    expect(await screen.findByText(/Central navigation for project health/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'End-to-end walkthrough' })).toBeInTheDocument()
  })
})
