import { DocumentAccessScope, WorkspaceRole } from '@/shared/api'

import { canAccessDocumentScope, selectCurrentRole, selectIsAuthenticated } from '@/entities/session/model/selectors.ts'

export function isAuthenticated() {
  return selectIsAuthenticated()
}

export function hasRole(allowedRoles: WorkspaceRole[]) {
  const role = selectCurrentRole()
  return role ? allowedRoles.includes(role) : false
}

export function hasDocumentAccess(scope: DocumentAccessScope) {
  return canAccessDocumentScope(scope)
}
