import { useMutation } from '@tanstack/react-query'

import type { ApiEntity, CreateProjectRequest, Project } from '@/shared/api'
import { http, queryClient } from '@/shared/api'

import { useSessionStore } from '@/entities/session'
import { projectQueryKeys } from './queries.ts'

function requireNumericUserId(userId: string | null | undefined) {
  const value = Number(userId)

  if (!Number.isFinite(value)) {
    throw new Error('Project creation requires a backend-authenticated user session.')
  }

  return value
}

export function useCreateProject() {
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string }) => {
      const currentUserId = useSessionStore.getState().currentUser?.id
      const ownerUserId = requireNumericUserId(currentUserId)
      const projectKey = `PRJ-${Date.now().toString().slice(-6)}`
      const payload: CreateProjectRequest = {
        key: projectKey,
        name,
        description,
        ownerUserId,
        status: 'active',
        visibilityMode: 'internal',
        progressPercent: 0,
        activeEpochId: null,
        dueDate: null,
        startedAt: null,
        completedAt: null
      }

      const { data } = await http.post<ApiEntity<Project>>('/projects', payload)
      return data
    },
    onSuccess: (project) => {
      useSessionStore.getState().setCurrentProjectId(String(project.id))
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.detail(String(project.id)) })
    }
  })
}
