import type { ApiEntity, Epoch, Project, Release, Task, User } from '@/shared/api'
import { WorkspaceRole, http } from '@/shared/api'
import type { LinkedEntity, UserSummary } from '@/shared/mocks/seamless.ts'

function toInitials(firstName?: string, lastName?: string) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export function formatDateLabel(value?: string | null) {
  if (!value) return 'Not scheduled'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export function formatDateTimeLabel(value?: string | null) {
  if (!value) return 'TBD'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function buildUserSummary(user?: ApiEntity<User> | null): UserSummary {
  return {
    id: String(user?.id ?? 'unknown-user'),
    name: [user?.firstName ?? '', user?.lastName ?? ''].join(' ').trim() || 'Unknown user',
    initials: toInitials(user?.firstName, user?.lastName) || 'UU',
    email: user?.email ?? '',
    role: (user?.role as WorkspaceRole | undefined) ?? WorkspaceRole.Manager,
    avatarUrl: user?.avatarUrl ?? null
  }
}

export async function fetchUsersMap() {
  const { data } = await http.get<Array<ApiEntity<User>>>('/users')
  return new Map(data.map((user) => [String(user.id), user]))
}

export function resolveLinkedEntityTitle(
  entityType: LinkedEntity['type'],
  entityId: string,
  resources: {
    tasks?: Map<string, ApiEntity<Task>>
    epochs?: Map<string, ApiEntity<Epoch>>
    releases?: Map<string, ApiEntity<Release>>
    projects?: Map<string, ApiEntity<Project>>
    meetings?: Map<string, { title: string }>
  }
) {
  if (entityType === 'task') return resources.tasks?.get(entityId)?.title ?? entityId
  if (entityType === 'epoch') return resources.epochs?.get(entityId)?.name ?? entityId
  if (entityType === 'release') return resources.releases?.get(entityId)?.version ?? entityId
  if (entityType === 'project') return resources.projects?.get(entityId)?.name ?? entityId
  if (entityType === 'meeting') return resources.meetings?.get(entityId)?.title ?? entityId
  return entityId
}
