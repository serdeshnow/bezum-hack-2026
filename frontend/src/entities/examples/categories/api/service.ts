import { api } from '@/shared/api'
import { type CategoriesDto, CategoriesDtoResponseSchema, type CategoriesQueryParams } from '@/entities/categories/api/contracts.ts'
import { categoriesApiEndpoints } from '@/entities/categories/api/endpoints.ts'

export const categoriesService = {
  async getCategories(params: Partial<CategoriesQueryParams>): Promise<CategoriesDto[]> {
    const response = await api.get(categoriesApiEndpoints.categories, { params })

    const parsed = CategoriesDtoResponseSchema.safeParse(response.data)
    if (!parsed.success) throw parsed.error

    return parsed.data.result.categories
  }
}
