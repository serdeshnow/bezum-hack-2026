import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'

import { HomePage } from '../../src/pages/home'

describe('HomePage', () => {
  it('renders the generic template shell messaging', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    )

    expect(screen.getByRole('heading', { name: 'Template Shell' })).toBeInTheDocument()
    expect(screen.getByText(/generic application shell/i)).toBeInTheDocument()
  })
})
