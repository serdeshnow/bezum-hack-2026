import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASEURL: z.string().url().default('http://localhost:3000/api'),
  __NODE_ENV__: z.string()
})

export const env = envSchema.parse({
  VITE_API_BASEURL: import.meta.env.VITE_API_BASEURL,
  __NODE_ENV__: import.meta.env.MODE
})

