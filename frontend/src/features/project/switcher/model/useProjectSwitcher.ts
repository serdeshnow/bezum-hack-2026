import { useQuery } from '@tanstack/react-query'

import { projectQueries } from '@/entities/project'
import { useSessionStore } from '@/entities/session'

export function useProjectSwitcher() {
  const currentProjectId = useSessionStore((state) => state.currentProjectId)
  const setCurrentProjectId = useSessionStore((state) => state.setCurrentProjectId)
  const { data: projects = [] } = useQuery(projectQueries.list())

  const currentProject = projects.find((project) => project.id === currentProjectId) ?? projects[0] ?? null

  return {
    projects,
    currentProjectId,
    currentProject,
    selectProject: setCurrentProjectId
  }
}
