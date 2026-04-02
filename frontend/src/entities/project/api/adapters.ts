import type { ProjectOverview } from '@/shared/mocks/seamless.ts'

export type ProjectOverviewViewModel = ProjectOverview & {
  activeEpochLabel: string
}

export function adaptProjectOverviewViewModel(project: ProjectOverview): ProjectOverviewViewModel {
  return {
    ...project,
    activeEpochLabel: project.stats.activeEpoch ? `${project.stats.activeEpoch.name} active` : 'No active epoch'
  }
}
