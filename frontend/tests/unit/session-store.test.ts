import { useSessionStore } from '../../src/entities/session'

describe('session store', () => {
  it('boots with an authenticated default user', () => {
    const state = useSessionStore.getState()

    expect(state.status).toBe('authenticated')
    expect(state.isAuthenticated).toBe(true)
    expect(state.currentUserId).toBeTruthy()
    expect(state.currentUser?.email).toBe('sarah@seamless.dev')
  })

  it('supports sign out, sign in, and verification', () => {
    useSessionStore.getState().signOut()
    expect(useSessionStore.getState().status).toBe('anonymous')
    expect(useSessionStore.getState().isAuthenticated).toBe(false)

    const user = useSessionStore.getState().signIn('alex@seamless.dev')
    expect(user.email).toBe('alex@seamless.dev')
    expect(useSessionStore.getState().status).toBe('pending-verification')
    expect(useSessionStore.getState().isAuthenticated).toBe(false)

    useSessionStore.getState().verify()
    expect(useSessionStore.getState().status).toBe('authenticated')
    expect(useSessionStore.getState().isAuthenticated).toBe(true)
    expect(useSessionStore.getState().role).toBe(user.role)
  })
})
