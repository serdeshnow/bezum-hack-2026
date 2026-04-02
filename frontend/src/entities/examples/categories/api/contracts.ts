import { z } from 'zod'

// Query Params
export const CategoriesQueryParamsSchema = z.object({
  per_page: z.number().optional(),
  page_number: z.number().optional(),

  marketplace_id: z.number(),

  name: z.string().optional(),
})
export type CategoriesQueryParams = z.infer<typeof CategoriesQueryParamsSchema>

export const CategoriesDtoSchema = z.object({
  id: z.number(), // Внутренний id
  name: z.string()
})
export type CategoriesDto = z.infer<typeof CategoriesDtoSchema>

// Result
export const CategoriesDtoResultSchema = z.object({
  categories: z.array(CategoriesDtoSchema),
  total_rows_count: z.number()
})
export type CategoriesDtoResult = z.infer<typeof CategoriesDtoResultSchema>

// Response
export const CategoriesDtoResponseSchema = z.object({
  status: z.enum(['success', 'error']),
  result: CategoriesDtoResultSchema
})
export type CategoriesDtoResponse = z.infer<typeof CategoriesDtoResponseSchema>
