import { http } from '@/shared/api'

export type BackendAuthUser = {
  id: string | number
  email: string
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  role?: string | null
  isActive?: boolean
}

export type LoginRequest = {
  email: string
  password: string
}

export type LoginResult = {
  accessToken: string
  expiresAt?: string
  sessionId?: string
  user: BackendAuthUser
}

export type AuthSuccessResponse = {
  success: boolean
}

export async function loginWithPassword(payload: LoginRequest) {
  const { data } = await http.post<LoginResult>('/auth/login', payload)
  return data
}

export async function getCurrentBackendUser() {
  const { data } = await http.get<BackendAuthUser>('/auth/me')
  return data
}

export async function logoutBackend() {
  const { data } = await http.post<AuthSuccessResponse>('/auth/logout')
  return data
}
