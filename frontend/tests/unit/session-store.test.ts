import { useSessionStore } from '../../src/entities/session'

describe('session store', () => {
  it('boots with an authenticated default user', () => {
    const state = useSessionStore.getState()

    expect(state.status).toBe('authenticated')
    expect(state.currentUser?.email).toBe('sarah@seamless.dev')
  })

  it('supports sign out and sign in', () => {
    useSessionStore.getState().signOut()
    expect(useSessionStore.getState().status).toBe('anonymous')

    const user = useSessionStore.getState().signIn('alex@seamless.dev')
    expect(user.email).toBe('alex@seamless.dev')
    expect(useSessionStore.getState().status).toBe('authenticated')
  })
})
