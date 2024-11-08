'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { updateUserTheme } from '@/actions/users/user-theme'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { UserPreferences } from '@/db/schema'
import { useToast } from '@/hooks/use-toast'

export default function ThemeSwitch() {
  const storedTheme = localStorage.getItem('theme') as UserPreferences['theme']

  const [newTheme, setNewTheme] = useState(storedTheme)
  const [isUpdating, setIsUpdating] = useState(false)
  const { setTheme: setProviderTheme } = useTheme()
  const toast = useToast()

  useEffect(() => {
    async function setUserTheme() {
      setNewTheme(newTheme || 'light')
    }
    setUserTheme()
  }, [newTheme])

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
    <div>
      <h2 className='mb-4 text-lg font-bold'>Select your preferred theme 😎</h2>

      <div className='flex items-center gap-x-2'>
        <Switch checked={newTheme === 'dark'} onCheckedChange={toggleTheme} disabled={isUpdating} />
        <Label>{newTheme === 'dark' ? 'Dark' : 'Light'} Theme</Label>
      </div>
    </div>
  )
}
