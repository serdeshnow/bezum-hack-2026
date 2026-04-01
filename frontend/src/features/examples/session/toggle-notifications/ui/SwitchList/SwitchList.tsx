import s from './SwitchList.module.scss'

import { toast } from 'sonner'

import { Switch } from 'antd'

import { useToggleNotifications } from '@/features/session/toggle-notifications/api/mutations.ts'
import { useQuery } from '@tanstack/react-query'
import { sessionQueries } from '@/entities/session'
import { SwitchListSkeleton } from '@/features/session/toggle-notifications/ui/SwitchList/SwitchListSkeleton.tsx'

export function SwitchList() {
  const { data, isFetching, isFetched, error: queryError } = useQuery({ ...sessionQueries.settings() })
  const toggleNotifications = useToggleNotifications()

  const handleSwitch = async (checked: boolean) => {
    if (queryError) {
      toast.error('Данные по уведомлениям недоступны')
      throw new Error(queryError.message)
    }

    try {
      const response = await toggleNotifications.mutateAsync({ notifications_flag: checked })
      toast.success(response.notifications_flag ? 'Уведомления включены' : 'Уведомления выключены')
    } catch (_error) {
      toast.error('Не удалось изменить настройки')
    }
  }

  if (isFetching) return <SwitchListSkeleton />

  return (
    <ul className={s.list}>
      <li className={s.item}>
        <Switch
          loading={toggleNotifications.isPending}
          onChange={(checked) => handleSwitch(checked)}
          disabled={!isFetched}
          value={data?.notifications_flag}
        />
        <p className={s.label}>Включить уведомления по Email</p>
      </li>
    </ul>
  )
}
