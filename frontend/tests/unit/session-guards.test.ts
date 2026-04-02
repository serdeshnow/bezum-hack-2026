import { DocumentAccessScope, WorkspaceRole } from '../../src/shared/api'
import { canAccessDocumentScope, useSessionStore } from '../../src/entities/session'

describe('session guards', () => {
  it('allows developers to access dev and internal documents only', () => {
    useSessionStore.getState().signOut()
    useSessionStore.getState().signIn('alex@seamless.dev')
    useSessionStore.getState().verify()

    expect(useSessionStore.getState().role).toBe(WorkspaceRole.Developer)
    expect(canAccessDocumentScope(DocumentAccessScope.Dev)).toBe(true)
    expect(canAccessDocumentScope(DocumentAccessScope.Internal)).toBe(true)
    expect(canAccessDocumentScope(DocumentAccessScope.Customer)).toBe(false)
  })

  it('allows managers to access all document scopes', () => {
    useSessionStore.getState().signOut()
    useSessionStore.getState().signIn('sarah@seamless.dev')
    useSessionStore.getState().verify()

    expect(useSessionStore.getState().role).toBe(WorkspaceRole.Manager)
    expect(canAccessDocumentScope(DocumentAccessScope.Manager)).toBe(true)
    expect(canAccessDocumentScope(DocumentAccessScope.Dev)).toBe(true)
    expect(canAccessDocumentScope(DocumentAccessScope.Customer)).toBe(true)
  })
})
