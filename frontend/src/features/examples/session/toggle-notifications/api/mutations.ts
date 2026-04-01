import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/shared/api'
import { sessionQueries, sessionService } from '@/entities/session'
import type { Config } from '@/entities/session/api/contracts.ts'

export const useToggleNotifications = () => {
  const queryKey = [...sessionQueries.settingsKey(), 'notifications']

  return useMutation({
    mutationFn: (params: Partial<Config>) =>
      sessionService.putSettings({
        notifications_flag: params.notifications_flag
      }),

    onMutate() {},

    onSuccess: (_data, __variables, ___context) => {
      const generalSettings: Config[] = queryClient.getQueryData(queryKey) ?? []
      if (generalSettings) {
        queryClient.setQueryData(queryKey, []) // Обнулили историю чата
      }
    },

    // onError: (err: Error) => {
    //
    // },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ ...sessionQueries.settings() })
    }
  })
}
