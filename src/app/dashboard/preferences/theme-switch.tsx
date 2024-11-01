'use client'

import { useTheme } from 'next-themes'
import { useState } from 'react'
import { updateUserTheme } from '@/actions/user-theme'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserPreferences } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

function ThemeSwitch({ currentTheme }: { currentTheme: UserPreferences['theme'] }) {
  const [newTheme, setNewTheme] = useState<UserPreferences['theme']>(
    currentTheme === 'light' || currentTheme === 'dark' ? currentTheme : 'light'
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const { setTheme: setProviderTheme } = useTheme()
  const toast = useToast()

  const handleThemeChange = async (theme: UserPreferences['theme']) => {
    setIsUpdating(true)

    const { message, success } = await updateUserTheme(theme || 'light')

    if (success) {
      toast.success(message)
      setProviderTheme(theme || 'light')
    } else {
      console.error(message)
      toast.error(message)
    }
    setIsUpdating(false)
  }

  const toggleTheme = () => {
    const newThemeValue: UserPreferences['theme'] = newTheme === 'light' ? 'dark' : 'light'
    setNewTheme(newThemeValue)
    handleThemeChange(newThemeValue)
  }

  return (
    <div className='flex items-center gap-x-2'>
      <Switch checked={newTheme === 'dark'} onCheckedChange={toggleTheme} disabled={isUpdating} />
      <Label>{newTheme === 'dark' ? 'Dark' : 'Light'} Theme</Label>
    </div>
  )
}

export default ThemeSwitch
