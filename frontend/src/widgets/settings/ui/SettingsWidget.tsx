import { useQuery } from '@tanstack/react-query'

import { ThemePreference } from '@/shared/api'
import { updateNotificationSettings } from '@/shared/mocks/seamless.ts'
import { queryClient } from '@/shared/api'
import { sessionService, useSessionStore } from '@/entities/session'
import { useThemePreference } from '@/features/theme/toggle'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, PageState, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui'

export function SettingsWidget() {
  const user = useSessionStore((state) => state.currentUser)
  const { applyThemePreference } = useThemePreference()
  const { data, isLoading, error } = useQuery({
    queryKey: ['settings', user?.id],
    queryFn: () => sessionService.getSettings()
  })

  if (isLoading) {
    return <PageState state='loading' title='Loading settings' description='Resolving profile, theme, and notification preferences.' />
  }

  if (error || !data) {
    return <PageState state='error' title='Settings unavailable' description='User settings could not be loaded.' />
  }

  return (
    <section className='space-y-6'>
      <div>
        <h1 className='text-2xl font-semibold'>Settings</h1>
        <p className='text-muted-foreground text-sm'>Profile, theme preference, and unified notification defaults.</p>
      </div>

      <div className='grid gap-4 xl:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Current frontend auth shell uses env + localStorage bootstrap until backend auth endpoints arrive.</CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            <p><span className='text-muted-foreground'>Name:</span> {data.profile.firstName} {data.profile.lastName}</p>
            <p><span className='text-muted-foreground'>Email:</span> {data.profile.email}</p>
            <p><span className='text-muted-foreground'>Role:</span> {data.profile.role}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <Label>Theme</Label>
            <Select
              value={data.appearance.theme}
              onValueChange={(value) => {
                void applyThemePreference(value as ThemePreference)
                queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select theme' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ThemePreference.Light}>light</SelectItem>
                <SelectItem value={ThemePreference.Dark}>dark</SelectItem>
                <SelectItem value={ThemePreference.System}>system</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Single notification channel across docs, tasks, meetings, PRs, and releases.</CardDescription>
        </CardHeader>
        <CardContent className='grid gap-3 md:grid-cols-2'>
          {Object.entries(data.notifications).map(([key, value]) => (
            <div key={key} className='flex items-center justify-between rounded-lg border p-3 text-sm'>
              <span>{key}</span>
              <Button
                variant={value ? 'default' : 'outline'}
                size='sm'
                onClick={() => {
                  updateNotificationSettings(user?.id ?? 'user-manager', { [key]: !value })
                  queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
                }}
              >
                {value ? 'Enabled' : 'Disabled'}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}
