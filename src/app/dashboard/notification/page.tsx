import { eq } from 'drizzle-orm'
import { Bell, Calendar } from 'lucide-react'
import { checkUserDeadlines } from '@/actions/notifications/deadline'
import { getUserNotificationsByUserId } from '@/actions/notifications/notifications'
import { auth } from '@/auth'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { database } from '@/db'
import { notifications } from '@/db/schema'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session) return null

  // Check for new notifications whenever the page loads
  await checkUserDeadlines(session.user.id)

  // Get all notifications for the user
  const { data: userNotifications } = await getUserNotificationsByUserId({
    userId: session.user.id
  })

  return (
    <div className='container mx-auto p-6'>
      <div className='flex items-center gap-2 mb-6'>
        <Bell className='h-6 w-6' />
        <h1 className='text-2xl font-bold'>Notifications</h1>
      </div>

      <div className='space-y-4'>
        {userNotifications.length === 0 ? (
          <Alert>
            <Calendar className='h-4 w-4' />
            <AlertTitle>No Notifications</AlertTitle>
            <AlertDescription>
              You're all caught up! No pending notifications at the moment.
            </AlertDescription>
          </Alert>
        ) : (
          userNotifications.map(notification => (
            <Alert
              key={notification.id}
              className={notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}
            >
              <Calendar className='h-4 w-4' />
              <AlertTitle>{notification.title}</AlertTitle>
              <AlertDescription className='flex justify-between items-center'>
                <span>{notification.message}</span>
                {!notification.isRead && (
                  <form
                    action={async () => {
                      'use server'
                      await database
                        .update(notifications)
                        .set({ isRead: true })
                        .where(eq(notifications.id, notification.id))
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
