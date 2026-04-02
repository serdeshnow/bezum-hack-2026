import type { ThemePreference, User, UserPreferences, WorkspaceRole } from '@/shared/api'
import type { SettingsData, UserSummary } from '@/shared/mocks/seamless.ts'

import type { UserSettingsViewModel } from '@/entities/user/model/types.ts'

function splitName(name: string) {
  const [firstName = '', ...rest] = name.split(' ')
  return {
    firstName,
    lastName: rest.join(' ')
  }
}

export function adaptUserSummaryToUserEntity(summary: UserSummary): User {
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

export function adaptSettingsDataToUserPreferences(settings: SettingsData): UserPreferences {
  return {
    userId: settings.profile.userId,
    theme: settings.appearance.theme,
    emailNotifications: settings.notifications.emailNotifications,
    taskAssignmentsEnabled: settings.notifications.taskAssignmentsEnabled,
    meetingRemindersEnabled: settings.notifications.meetingRemindersEnabled,
    releaseNotificationsEnabled: settings.notifications.releaseNotificationsEnabled,
    mentionNotificationsEnabled: settings.notifications.mentionNotificationsEnabled
  }
}

export function adaptUserAndPreferencesToSettingsViewModel(
  userId: string,
  user: User,
  preferences: UserPreferences
): UserSettingsViewModel {
  return {
    profile: {
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role as WorkspaceRole,
      avatarUrl: user.avatarUrl ?? null
    },
    appearance: {
      theme: preferences.theme as ThemePreference
    },
    notifications: {
      emailNotifications: preferences.emailNotifications,
      taskAssignmentsEnabled: preferences.taskAssignmentsEnabled,
      meetingRemindersEnabled: preferences.meetingRemindersEnabled,
      releaseNotificationsEnabled: preferences.releaseNotificationsEnabled,
      mentionNotificationsEnabled: preferences.mentionNotificationsEnabled
    }
  }
}
