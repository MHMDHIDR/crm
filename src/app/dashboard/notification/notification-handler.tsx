'use client'

import { Bell, CheckCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { getCookie, setCookie } from '@/lib/cookies'
import type { Notification } from '@/db/schema'

const COOKIE_NAME = 'NOTIFICATION_DISMISSED'

export default function NotificationHandler({ notifications }: { notifications: Notification[] }) {
  const notificationTranslations = useTranslations('dashboard.notifications')
  const toast = useToast()
  const [permission, setPermission] = useState('default')
  const [showDialog, setShowDialog] = useState(false)
  const [hasDismissed, setHasDismissed] = useState(() => getCookie(COOKIE_NAME))

  // Move showNotification into useCallback to prevent recreation on every render
  const showNotification = useCallback(
    (notification: Notification) => {
      if (permission !== 'granted') return

      const notificationTitle =
        notification.type === 'project_deadline' ? 'Project Deadline Alert' : 'Task Deadline Alert'

      const options = {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        data: {
          url:
            notification.type === 'project_deadline'
              ? `/dashboard/projects/${notification.referenceId}`
              : `/dashboard/tasks/${notification.referenceId}`
        }
      }

      const browserNotification = new Notification(notificationTitle, options)

      browserNotification.onclick = event => {
        event.preventDefault()
        window.focus()
        window.location.href = browserNotification.data.url
      }
    },
    [permission]
  )

  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        setShowDialog(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }, [])

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications')
      return
    }

    // Get current permission state
    const currentPermission = Notification.permission
    setPermission(currentPermission)

    // Show dialog if permission is not granted and user hasn't dismissed it
    if (currentPermission !== 'granted' && !hasDismissed) {
      setShowDialog(true)
    }
  }, [toast, hasDismissed])

  // Separate useEffect for handling notifications
  useEffect(() => {
    if (notifications && notifications.length > 0 && permission === 'granted') {
      notifications.forEach(notification => {
        if (!notification.isRead) {
          showNotification(notification)
        }
      })
    }
  }, [notifications, showNotification, permission])

  return (
    <AlertDialog
      open={showDialog}
      onOpenChange={open => {
        setShowDialog(open)
        if (!open) {
          setHasDismissed(true)
          setCookie(COOKIE_NAME, true)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className='flex items-center gap-2'>
            <Bell className='h-5 w-5' />
            {notificationTranslations('enable')}
          </AlertDialogTitle>
          <AlertDialogDescription className='rtl:text-right font-bold'>
            {notificationTranslations('enableMessage')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex flex-1'>
          {permission !== 'denied' && (
            <AlertDialogAction
              onClick={requestPermission}
              className='bg-primary hover:bg-primary/90 flex-1 font-bold text-green-600 text-md'
            >
              <CheckCircle className='h-5 w-5' />
              {notificationTranslations('enable')}
            </AlertDialogAction>
          )}
          {permission === 'denied' && (
            <AlertDialogDescription className='text-sm text-destructive'>
              {notificationTranslations('blockedMessage')}
            </AlertDialogDescription>
          )}
          {permission === 'denied' && <AlertDialogCancel>Close</AlertDialogCancel>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
