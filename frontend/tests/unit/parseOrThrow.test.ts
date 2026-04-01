import { z } from 'zod'

import { parseOrThrow } from '../../src/shared/lib'

describe('parseOrThrow', () => {
  it('returns parsed data for valid payload', () => {
    const schema = z.object({
      id: z.number(),
      name: z.string()
    })

    expect(parseOrThrow(schema, { id: 1, name: 'Grass' })).toEqual({
      id: 1,
      name: 'Grass'
    })
  })

  it('throws for invalid payload', () => {
    const schema = z.object({
      id: z.number()
    })

    expect(() => parseOrThrow(schema, { id: '1' })).toThrow()
  })
})
