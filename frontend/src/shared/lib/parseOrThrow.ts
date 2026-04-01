import { ZodSchema } from 'zod'

export function parseOrThrow<T>(schema: ZodSchema<T>, data: unknown): T {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    console.error(parsed.error.errors)
    parsed.error.errors.forEach(err => {
      console.error(`  • ${err.path.join('.')} — ${err.message}`)
    })
    // MAYBE: Здесь можно обернуть в свой ApiError, добавить контекст
    throw parsed.error
  }
  return parsed.data
}
