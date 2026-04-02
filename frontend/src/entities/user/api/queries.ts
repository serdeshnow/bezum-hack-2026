import { queryOptions } from '@tanstack/react-query'

import type { ApiEntity, User, UserPreferences } from '@/shared/api'
import { http, withBackendFallback } from '@/shared/api'
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
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const { data } = await http.get<ApiEntity<User>>(`/users/${userId}`)
            return data
          },
          () => adaptUserSummaryToUserEntity(getUserById(userId))
        )
    }),
  preferences: (userId: string) =>
    queryOptions({
      queryKey: userQueryKeys.preferences(userId),
      queryFn: async () =>
        withBackendFallback(
          async () => {
            const { data } = await http.get<UserPreferences>(`/users/${userId}/preferences`)
            return data
          },
          () => adaptSettingsDataToUserPreferences(getSettings(userId))
        )
    }),
  settings: (userId: string) =>
    queryOptions({
      queryKey: userQueryKeys.settings(userId),
      queryFn: async () => {
        const [user, preferences] = await Promise.all([
          withBackendFallback(
            async () => {
              const { data } = await http.get<ApiEntity<User>>(`/users/${userId}`)
              return data
            },
            () => adaptUserSummaryToUserEntity(getUserById(userId))
          ),
          withBackendFallback(
            async () => {
              const { data } = await http.get<UserPreferences>(`/users/${userId}/preferences`)
              return data
            },
            () => adaptSettingsDataToUserPreferences(getSettings(userId))
          )
        ])
        return adaptUserAndPreferencesToSettingsViewModel(userId, user, preferences)
      }
    })
}
