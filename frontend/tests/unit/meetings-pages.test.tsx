import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'

import { MeetingSchedulerPage } from '../../src/pages/meeting-scheduler/MeetingSchedulerPage'
import { MeetingRecapPage } from '../../src/pages/meeting-recap/MeetingRecapPage'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
}

describe('meeting routes', () => {
  it('renders the meeting scheduler with live meeting data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MeetingSchedulerPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Meeting Scheduler' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Slot voting matrix' })).toBeInTheDocument()
  })

  it('renders the meeting recap with summary and transcript context', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/meetings/meeting-1']}>
          <Routes>
            <Route element={<MeetingRecapPage />} path='/meetings/:meetingId' />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Meeting Recap' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Mark as pending review' })).toBeInTheDocument()
  })
})
