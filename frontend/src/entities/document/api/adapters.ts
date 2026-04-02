import type { DocumentEditorData, DocumentHistoryVersion, LinkedEntity } from '@/shared/mocks/seamless.ts'

export type DocumentEditorViewModel = DocumentEditorData & {
  linkedEntitySummary: {
    total: number
    tasks: number
    meetings: number
    releases: number
    epochs: number
    projects: number
  }
  quoteTargetTaskId: string
}

export type DocumentHistoryViewModel = DocumentHistoryVersion & {
  totalChanges: number
  approvalTrail: string[]
}

function summarizeLinkedEntities(entities: LinkedEntity[]) {
  return entities.reduce(
    (acc, entity) => {
      acc.total += 1
      if (entity.type === 'task') acc.tasks += 1
      if (entity.type === 'meeting') acc.meetings += 1
      if (entity.type === 'release') acc.releases += 1
      if (entity.type === 'epoch') acc.epochs += 1
      if (entity.type === 'project') acc.projects += 1
      return acc
    },
    { total: 0, tasks: 0, meetings: 0, releases: 0, epochs: 0, projects: 0 }
  )
}

export function adaptDocumentEditorViewModel(data: DocumentEditorData): DocumentEditorViewModel {
  const linkedTask = data.linkedEntities.find((entity) => entity.type === 'task')

  return {
    ...data,
    linkedEntitySummary: summarizeLinkedEntities(data.linkedEntities),
    quoteTargetTaskId: linkedTask?.id ?? 'task-docs'
  }
}

export function adaptDocumentHistoryViewModel(version: DocumentHistoryVersion): DocumentHistoryViewModel {
  return {
    ...version,
    totalChanges: version.changes.additions + version.changes.deletions + version.changes.modifications,
    approvalTrail: version.approvals.map((approval) => `${approval.approver.name}: ${approval.status}`)
  }
}
