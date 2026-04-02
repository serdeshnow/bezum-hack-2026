import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { projectQueries } from '@/entities/project'
import { useSessionStore } from '@/entities/session'

export function useProjectSwitcher() {
  const currentProjectId = useSessionStore((state) => state.currentProjectId)
  const setCurrentProjectId = useSessionStore((state) => state.setCurrentProjectId)
  const { data: projects = [] } = useQuery(projectQueries.list())

  const currentProject = projects.find((project) => project.id === currentProjectId) ?? projects[0] ?? null

  useEffect(() => {
    if (!currentProjectId && currentProject) {
      setCurrentProjectId(currentProject.id)
      return
    }

    if (currentProject && !projects.some((project) => project.id === currentProjectId)) {
      setCurrentProjectId(currentProject.id)
    }
  }, [currentProject, currentProjectId, projects, setCurrentProjectId])

  return {
    projects,
    currentProjectId,
    currentProject,
    selectProject: setCurrentProjectId
  }
}
