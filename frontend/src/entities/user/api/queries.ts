import { queryOptions } from '@tanstack/react-query'

import { getSettings, getUserById } from '@/shared/mocks/seamless.ts'

import {
  adaptSettingsDataToUserPreferences,
  adaptUserAndPreferencesToSettingsViewModel,
  adaptUserSummaryToUserEntity
} from './adapters.ts'

export const userQueryKeys = {
  current: (userId: string) => ['users', userId] as const,
  preferences: (userId: string) => ['users', userId, 'preferences'] as const,
  settings: (userId: string) => ['users', userId, 'settings'] as const
}

export const userQueries = {
  current: (userId: string) =>
    queryOptions({
      queryKey: userQueryKeys.current(userId),
      queryFn: async () => adaptUserSummaryToUserEntity(getUserById(userId))
    }),
  preferences: (userId: string) =>
    queryOptions({
      queryKey: userQueryKeys.preferences(userId),
      queryFn: async () => adaptSettingsDataToUserPreferences(getSettings(userId))
    }),
  settings: (userId: string) =>
    queryOptions({
      queryKey: userQueryKeys.settings(userId),
      queryFn: async () => {
        const user = adaptUserSummaryToUserEntity(getUserById(userId))
        const preferences = adaptSettingsDataToUserPreferences(getSettings(userId))
        return adaptUserAndPreferencesToSettingsViewModel(userId, user, preferences)
      }
    })
}
