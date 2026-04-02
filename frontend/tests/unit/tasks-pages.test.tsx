import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'

import { KanbanBoardPage } from '../../src/pages/kanban-board/KanbanBoardPage'
import { TaskDetailsPage } from '../../src/pages/task-details/TaskDetailsPage'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
}

describe('task routes', () => {
  it('renders the kanban board page with live task data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <KanbanBoardPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Kanban Board' })).toBeInTheDocument()
    expect(await screen.findByText('ATL-101')).toBeInTheDocument()
  })

  it('renders the task details page with linked context', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/tasks/task-1']}>
          <Routes>
            <Route element={<TaskDetailsPage />} path='/tasks/:taskId' />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Implement payment session orchestration' })).toBeInTheDocument()
    expect(await screen.findByText(/Linked docs/i)).toBeInTheDocument()
  })
})
