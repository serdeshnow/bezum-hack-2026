import { Moon, Sun } from 'lucide-react'

import { Button } from '@/shared/ui'

import { useThemePreference } from '../model/useThemePreference.ts'

export function ThemeToggleButton() {
  const { toggleTheme, isPending } = useThemePreference()

  return (
    <Button
      variant='ghost'
      size='icon'
      className='size-8 rounded-[5px]'
      onClick={() => {
        void toggleTheme()
      }}
      disabled={isPending}
    >
      <Sun className='size-[18px] dark:hidden' />
      <Moon className='hidden size-[18px] dark:block' />
    </Button>
  )
}
