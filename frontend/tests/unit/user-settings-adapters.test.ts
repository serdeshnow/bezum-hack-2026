import { ThemePreference, WorkspaceRole } from '../../src/shared/api'
import {
  adaptSettingsDataToUserPreferences,
  adaptUserAndPreferencesToSettingsViewModel,
  adaptUserSummaryToUserEntity
} from '../../src/entities/user'

describe('user settings adapters', () => {
  it('adapts summary and preferences into a settings view model', () => {
    const user = adaptUserSummaryToUserEntity({
      id: 'user-manager',
      name: 'Sarah Chen',
      initials: 'SC',
      email: 'sarah@seamless.dev',
      role: WorkspaceRole.Manager
    })

    const preferences = adaptSettingsDataToUserPreferences({
      profile: {
        userId: 'user-manager',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah@seamless.dev',
        role: WorkspaceRole.Manager,
        avatarUrl: null
      },
      appearance: {
        theme: ThemePreference.System
      },
      notifications: {
        emailNotifications: true,
        taskAssignmentsEnabled: true,
        meetingRemindersEnabled: false,
        releaseNotificationsEnabled: true,
        mentionNotificationsEnabled: true
      }
    })

    const viewModel = adaptUserAndPreferencesToSettingsViewModel('user-manager', user, preferences)

    expect(viewModel.profile.email).toBe('sarah@seamless.dev')
    expect(viewModel.appearance.theme).toBe(ThemePreference.System)
    expect(viewModel.notifications.meetingRemindersEnabled).toBe(false)
  })
})
