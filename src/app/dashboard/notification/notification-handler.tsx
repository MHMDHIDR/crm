'use client'

import { Bell } from 'lucide-react'
import React, { useEffect, useState } from 'react'
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
import type { Notification } from '@/db/schema'

export default function NotificationHandler({ notifications }: { notifications: Notification[] }) {
  const [permission, setPermission] = useState('default')
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return
    }

    // Get current permission state
    const currentPermission = Notification.permission
    setPermission(currentPermission)

    // Show dialog if permission is not granted
    if (currentPermission !== 'granted') {
      setShowDialog(true)
    }

    // Watch for new notifications
    if (notifications && notifications.length > 0) {
      notifications.forEach(notification => {
        if (!notification.isRead) {
          showNotification(notification)
        }
      })
    }
  }, [notifications])

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        setShowDialog(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
    }
  }

  const showNotification = (notification: Notification) => {
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

    browserNotification.onclick = function (event) {
      event.preventDefault()
      window.focus()
      window.location.href = browserNotification.data.url
    }
  }

  return (
    <>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              Enable Notifications
            </AlertDialogTitle>
            <AlertDialogDescription>
              Stay updated with important deadline notifications for your projects and tasks. Enable
              notifications to receive timely alerts about upcoming deadlines.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {permission !== 'denied' && (
              <AlertDialogAction
                onClick={requestPermission}
                className='bg-primary hover:bg-primary/90'
              >
                Enable Notifications
              </AlertDialogAction>
            )}
            {permission === 'denied' && (
              <AlertDialogDescription className='text-sm text-destructive'>
                Notifications are blocked. Please enable them in your browser settings to receive
                alerts.
              </AlertDialogDescription>
            )}
            {permission === 'denied' && <AlertDialogCancel>Close</AlertDialogCancel>}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
