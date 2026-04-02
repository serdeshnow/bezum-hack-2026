import { WorkspaceRole } from '@/shared/api'

import { useSessionStore } from '@/entities/session/model/session.ts'

export function isAuthenticated() {
  return useSessionStore.getState().status === 'authenticated'
}

export function hasRole(allowedRoles: WorkspaceRole[]) {
  const role = useSessionStore.getState().currentUser?.role
  return role ? allowedRoles.includes(role) : false
}
