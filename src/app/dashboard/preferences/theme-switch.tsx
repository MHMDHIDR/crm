'use client'

import { useTheme } from 'next-themes'
import { useState } from 'react'
import { updateUserTheme } from '@/actions/user-theme'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserPreferences } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

function ThemeSwitch({ currentTheme }: { currentTheme: UserPreferences['theme'] }) {
  const [theme, setTheme] = useState(currentTheme)
  const [isUpdating, setIsUpdating] = useState(false)
  const { setTheme: setProviderTheme } = useTheme()
  const toast = useToast()

  const handleThemeChange = async () => {
    setIsUpdating(true)
    const newTheme = theme === 'light' ? 'dark' : 'light'

    const { message, success } = await updateUserTheme(newTheme)

    if (success) {
      setTheme(newTheme)
      setProviderTheme(newTheme) // Update the theme provider immediately

      toast.success(message)
    } else {
      console.error(message)
      toast.error(message)
    }

    setIsUpdating(false)
  }

  return (
    <div className='flex items-center gap-x-2'>
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={handleThemeChange}
        disabled={isUpdating}
      />
      <Label>{theme === 'dark' ? 'Dark' : 'Light'} Theme</Label>
    </div>
  )
}

export default ThemeSwitch
