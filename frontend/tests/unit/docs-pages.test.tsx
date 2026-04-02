import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'

import { DocsHubPage } from '../../src/pages/docs-hub/DocsHubPage'
import { DocumentEditorPage } from '../../src/pages/document-editor/DocumentEditorPage'
import { DocumentHistoryPage } from '../../src/pages/document-history/DocumentHistoryPage'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  })
}

describe('docs routes', () => {
  it('renders the docs hub with real document data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DocsHubPage />
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Documentation Hub' })).toBeInTheDocument()
    expect(await screen.findByText('Customer Release Brief')).toBeInTheDocument()
  })

  it('renders the document editor with linked context', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/docs/doc-2']}>
          <Routes>
            <Route element={<DocumentEditorPage />} path='/docs/:documentId' />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByText('Open History')).toBeInTheDocument()
    expect(await screen.findByText(/Document content/i)).toBeInTheDocument()
  })

  it('renders the document history page with version data', async () => {
    const queryClient = createQueryClient()

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/docs/doc-2/history']}>
          <Routes>
            <Route element={<DocumentHistoryPage />} path='/docs/:documentId/history' />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    expect(await screen.findByRole('heading', { name: 'Version and Approval History' })).toBeInTheDocument()
    expect(await screen.findByText(/Decision Log/i)).toBeInTheDocument()
  })
})
