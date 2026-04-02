import type { ThemePreference, WorkspaceRole } from '@/shared/api'

export type UserSettingsViewModel = {
  profile: {
    userId: string
    firstName: string
    lastName: string
    email: string
    role: WorkspaceRole
    avatarUrl: string | null
  }
  appearance: {
    theme: ThemePreference
  }
  notifications: {
    emailNotifications: boolean
    taskAssignmentsEnabled: boolean
    meetingRemindersEnabled: boolean
    releaseNotificationsEnabled: boolean
    mentionNotificationsEnabled: boolean
  }
}
