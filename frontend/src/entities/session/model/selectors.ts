import { DocumentAccessScope, WorkspaceRole } from '@/shared/api'

import { useSessionStore } from './session.ts'

export function selectIsAuthenticated() {
  return useSessionStore.getState().isAuthenticated
}

export function selectSessionStatus() {
  return useSessionStore.getState().status
}

export function selectCurrentUser() {
  return useSessionStore.getState().currentUser
}

export function selectCurrentRole() {
  return useSessionStore.getState().role
}

export function canAccessDocumentScope(scope: DocumentAccessScope, role = selectCurrentRole()) {
  if (!role) return false

  if (role === WorkspaceRole.Admin || role === WorkspaceRole.Manager) return true
  if (role === WorkspaceRole.Developer) {
    return scope === DocumentAccessScope.Dev || scope === DocumentAccessScope.Internal
  }

  return scope === DocumentAccessScope.Customer
}
