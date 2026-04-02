import { StagePage } from '@/shared/ui'

export function SettingsPage() {
  return (
    <StagePage
      eyebrow='Settings'
      title='Workspace Settings'
      description='Settings remain in the scaffold because theme, notification preferences, and profile visibility will matter once the shared shell is in place. This route is intentionally small for now and will grow after the core business flows are wired.'
      highlights={[
        'Profile, notification, appearance, and security areas.',
        'Future source of user-preference driven inbox behavior.',
        'Place for theme and visibility preferences used across the shell.'
      ]}
      nextMoves={[
        'Connect user preferences from the Identity contracts.',
        'Add notification preference toggles that align with unified inbox behavior.',
        'Prepare theme controls for light and dark workspace modes.'
      ]}
    />
  )
}
