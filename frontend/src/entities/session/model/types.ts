import type { WorkspaceRole } from '@/shared/api'

export type SessionUser = {
  id: string
  name: string
  initials: string
  email: string
  role: WorkspaceRole
  avatarUrl?: string | null
}
