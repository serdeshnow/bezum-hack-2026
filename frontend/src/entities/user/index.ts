export { userQueries, userQueryKeys } from './api/queries.ts'
export { useUpdateThemePreference, useUpdateUserNotificationPreferences } from './api/mutations.ts'
export {
  adaptSettingsDataToUserPreferences,
  adaptUserAndPreferencesToSettingsViewModel,
  adaptUserSummaryToUserEntity
} from './api/adapters.ts'
export type { UserSettingsViewModel } from './model/types.ts'
