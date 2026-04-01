import { queryOptions } from '@tanstack/react-query'
import type { CategoriesQueryParams } from '@/entities/categories/api/contracts.ts'
import { categoriesService } from '@/entities/categories/api/service.ts'

export const categoryQueryKeys = {
  categoriesKey: () => ['categories'] as const,
}

export const categoriesQueries = {
  categories: (params: Partial<CategoriesQueryParams>) =>
    queryOptions({
      queryKey: [...categoryQueryKeys.categoriesKey()],
      queryFn: () => categoriesService.getCategories(params)
    })
}
