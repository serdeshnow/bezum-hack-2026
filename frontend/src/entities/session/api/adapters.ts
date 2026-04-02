import { WorkspaceRole } from '@/shared/api'
import type { ThemePreference, User, UserPreferences } from '@/shared/api'
import type { SettingsData, UserSummary } from '@/shared/mocks/seamless.ts'

import type { SessionUser } from '@/entities/session/model/types.ts'

function toInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

function splitName(name: string) {
  const [firstName = '', ...rest] = name.split(' ')
  return {
    firstName,
    lastName: rest.join(' ')
  }
}

function normalizeRole(role: string | null | undefined): WorkspaceRole {
  const value = String(role ?? '').toLowerCase()

  switch (value) {
    case WorkspaceRole.Admin:
      return WorkspaceRole.Admin
    case WorkspaceRole.Manager:
      return WorkspaceRole.Manager
    case WorkspaceRole.Customer:
      return WorkspaceRole.Customer
    case WorkspaceRole.Developer:
    default:
      return WorkspaceRole.Developer
  }
}

export function adaptUserSummaryToUser(summary: UserSummary): User {
  const { firstName, lastName } = splitName(summary.name)

  return {
    email: summary.email,
    firstName,
    lastName,
    avatarUrl: summary.avatarUrl ?? null,
    role: summary.role,
    isActive: true,
    passwordHash: null,
    lastLoginAt: null
  }
}

export function adaptUserToSessionUser(user: User, userId: string): SessionUser {
  const firstName = user.firstName ?? ''
  const lastName = user.lastName ?? ''

  return {
    id: userId,
    name: `${firstName} ${lastName}`.trim(),
    initials: toInitials(firstName, lastName),
    email: user.email,
    role: normalizeRole(user.role),
    avatarUrl: user.avatarUrl ?? null
  }
}

type BackendAuthUser = {
  id: string | number
  email: string
  firstName?: string | null
  lastName?: string | null
  displayName?: string | null
  avatarUrl?: string | null
  role?: string | null
}

export function adaptBackendAuthUserToSessionUser(user: BackendAuthUser): SessionUser {
  const firstName = user.firstName?.trim() ?? ''
  const lastName = user.lastName?.trim() ?? ''
  const displayName = user.displayName?.trim() ?? ''
  const derivedName = `${firstName} ${lastName}`.trim() || displayName || user.email
  const split = splitName(derivedName)

  return {
    id: String(user.id),
    name: derivedName,
    initials: toInitials(split.firstName, split.lastName || derivedName.split(' ').slice(1).join(' ')),
    email: user.email,
    role: normalizeRole(user.role),
    avatarUrl: user.avatarUrl ?? null
  }
}

export function adaptThemePreference(
  source: UserPreferences | SettingsData | null | undefined,
  fallback: ThemePreference
): ThemePreference {
  if (!source) return fallback

  if ('appearance' in source) {
    return source.appearance.theme
  }

  return (source.theme as ThemePreference | undefined) ?? fallback
}
