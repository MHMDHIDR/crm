import clsx from 'clsx'
import { Bell, Calendar } from 'lucide-react'
import { checkUserDeadlines } from '@/actions/notifications/deadline'
import {
  getUnreadNotificationsCount,
  getUserNotificationsByUserId,
  markNotificationAsRead
} from '@/actions/notifications/notifications'
import { auth } from '@/auth'
import EmptyState from '@/components/custom/empty-state'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  // Check for new notifications whenever the page loads
  await checkUserDeadlines(session.user.id)

  // Get all notifications for the user
  const { data: userNotifications } = await getUserNotificationsByUserId({
    userId: session.user.id
  })

  const { count: unreadNotificationsCount } = await getUnreadNotificationsCount()

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center gap-2 mb-6'>
        <Bell className='h-6 w-6' />
        <h1 className='flex items-center space-x-2 text-2xl font-bold'>
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <Badge variant={'destructive'} className={'text-base select-none'}>
              {unreadNotificationsCount}
            </Badge>
          )}
        </h1>
      </div>

      <div className='space-y-4'>
        {userNotifications.length === 0 ? (
          <Alert className='select-none'>
            <AlertTitle className='flex items-center gap-x-2'>
              <Calendar className='h-4 w-4' />
              <span>No Notifications!</span>
            </AlertTitle>
            <AlertDescription>
              <EmptyState>You're all caught up! No pending notifications at the moment.</EmptyState>
            </AlertDescription>
          </Alert>
        ) : (
          userNotifications.map(notification => (
            <Alert
              key={notification.id}
              className={clsx('hover:-translate-y-1.5 transition-transform hover:shadow', {
                'bg-gray-50': notification.isRead,
                'bg-blue-50': !notification.isRead
              })}
              href={
                notification.type === 'project_deadline'
                  ? '/dashboard/projects/' + notification.referenceId
                  : 'task_deadline'
                    ? '/dashboard/projects/' + notification.referenceId
                    : ''
              }
            >
              <Calendar className='h-4 w-4' />
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription className='flex justify-between items-center'>
                <span>{notification.message}</span>
                {!notification.isRead && (
                  <form
                    action={async () => {
                      'use server'
                      await markNotificationAsRead(notification.id)
                    }}
                  >
                    <Button variant='outline' size='sm'>
                      Mark as Read
                    </Button>
                  </form>
                )}
              </AlertDescription>
            </Alert>
          ))
        )}
      </div>
    </div>
  )
}
