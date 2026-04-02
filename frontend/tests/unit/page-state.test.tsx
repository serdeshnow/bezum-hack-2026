import { render, screen } from '@testing-library/react'

import { PageState } from '../../src/shared/ui'

describe('PageState', () => {
  it('renders an empty state message', () => {
    render(<PageState state='empty' title='Nothing here' description='Create the first item.' />)

    expect(screen.getByRole('heading', { name: 'Nothing here' })).toBeInTheDocument()
    expect(screen.getByText('Create the first item.')).toBeInTheDocument()
  })
})
