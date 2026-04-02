import { useMutation } from '@tanstack/react-query'

import type { ThemePreference, UpdateUserPreferencesRequest } from '@/shared/api'
import { queryClient } from '@/shared/api'
import { updateNotificationSettings, updateThemePreference } from '@/shared/mocks/seamless.ts'

import { userQueryKeys } from './queries.ts'

export function useUpdateThemePreference(userId: string) {
  return useMutation({
    mutationFn: async (theme: ThemePreference) => updateThemePreference(userId, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.preferences(userId) })
      queryClient.invalidateQueries({ queryKey: userQueryKeys.settings(userId) })
    }
  })
}

export function useUpdateUserNotificationPreferences(userId: string) {
  return useMutation({
    mutationFn: async (patch: UpdateUserPreferencesRequest) =>
      updateNotificationSettings(userId, {
        emailNotifications: patch.emailNotifications,
        taskAssignmentsEnabled: patch.taskAssignmentsEnabled,
        meetingRemindersEnabled: patch.meetingRemindersEnabled,
        releaseNotificationsEnabled: patch.releaseNotificationsEnabled,
        mentionNotificationsEnabled: patch.mentionNotificationsEnabled
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.preferences(userId) })
      queryClient.invalidateQueries({ queryKey: userQueryKeys.settings(userId) })
    }
  })
}
