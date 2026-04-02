import type { ThemePreference, User, UserPreferences, WorkspaceRole } from '@/shared/api'
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
    role: user.role as WorkspaceRole,
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
