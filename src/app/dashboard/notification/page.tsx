import clsx from 'clsx'
import { Bell, Calendar } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
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
import { Link } from '@/i18n/routing'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null
  const notificationTranslations = await getTranslations('dashboard.notifications')

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
        <h1 className='flex items-center gap-x-2 text-xl font-bold'>
          <span>{notificationTranslations('title')}</span>
          {unreadNotificationsCount > 0 && (
            <Badge variant={'destructive'} className={'text-base select-none'}>
              {unreadNotificationsCount}
            </Badge>
          )}
        </h1>
      </div>

      {userNotifications.length === 0 ? (
        <Alert className='select-none'>
          <AlertTitle className='flex items-center gap-x-2'>
            <Calendar className='h-4 w-4' />
            <span>{notificationTranslations('empty.title')}</span>
          </AlertTitle>
          <AlertDescription>
            <EmptyState>{notificationTranslations('empty.message')}</EmptyState>
          </AlertDescription>
        </Alert>
      ) : (
        userNotifications.map(notification => (
          <Alert
            key={notification.id}
            className={clsx(
              'md:hover:-translate-y-1.5 transition-transform md:hover:shadow mb-1.5 md:mb-2.5',
              {
                'bg-gray-50 dark:bg-gray-900': notification.isRead,
                'bg-blue-50 dark:bg-blue-950': !notification.isRead
              }
            )}
          >
            <header className='flex items-center gap-x-3'>
              <Calendar className='h-4 w-4' />
              <AlertTitle className='font-bold'>{notification.title}</AlertTitle>
            </header>
            <AlertDescription className='flex flex-col gap-1.5 sm:flex-row sm:items-center'>
              <span className='flex flex-1'>{notification.message}</span>
              <div className='flex'>
                {!notification.isRead && (
                  <form
                    action={async () => {
                      'use server'
                      await markNotificationAsRead(notification.id)
                    }}
                  >
                    <Button variant='outline' size='sm'>
                      {notificationTranslations('markAsRead')}
                    </Button>
                  </form>
                )}
                <Link
                  href={
                    notification.type === 'project_deadline'
                      ? `/dashboard/projects/${notification.referenceId}`
                      : notification.type === 'task_deadline'
                        ? `/dashboard/projects/${notification.referenceId}`
                        : ''
                  }
                >
                  <Button variant='link' size='sm' type='button'>
                    {notificationTranslations('viewDetails')}
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        ))
      )}
    </div>
  )
}
