import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MarkAllReadButton } from '@/components/notifications/MarkAllReadButton'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/utils'
import type { NotificationType } from '@/types'

export const dynamic = 'force-dynamic'

const TYPE_ICONS: Record<NotificationType, string> = {
  NEW_SUBSCRIBER: 'person_add',
  SUBSCRIBER_CANCELED: 'person_remove',
  NEW_MESSAGE: 'chat_bubble',
  POST_PUBLISHED: 'article',
  SUBSCRIPTION_EXPIRING: 'schedule',
  PAYOUT_PROCESSED: 'payments',
  PAYOUT_FAILED: 'error',
  CONTENT_REPORTED: 'flag',
  SYSTEM: 'info',
}

const TYPE_COLORS: Record<NotificationType, string> = {
  NEW_SUBSCRIBER: 'text-green-400',
  SUBSCRIBER_CANCELED: 'text-red-400',
  NEW_MESSAGE: 'text-primary',
  POST_PUBLISHED: 'text-blue-400',
  SUBSCRIPTION_EXPIRING: 'text-amber-400',
  PAYOUT_PROCESSED: 'text-green-400',
  PAYOUT_FAILED: 'text-red-400',
  CONTENT_REPORTED: 'text-amber-400',
  SYSTEM: 'text-outline',
}

type DbNotification = {
  id: string
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: Date
}

function NotificationRow({ notification }: { notification: DbNotification }) {
  const type = notification.type as NotificationType
  const icon = TYPE_ICONS[type] ?? 'notifications'
  const color = TYPE_COLORS[type] ?? 'text-outline'

  const inner = (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl transition-colors ${
        notification.read
          ? 'bg-transparent hover:bg-surface-container'
          : 'bg-surface-container hover:bg-surface-container-high'
      }`}
    >
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
          notification.read ? 'bg-surface-container' : 'bg-surface-container-high'
        }`}
      >
        <span
          className={`material-symbols-outlined text-lg ${color}`}
          aria-hidden="true"
          style={notification.read ? undefined : { fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold leading-snug ${
            notification.read ? 'text-on-surface-variant' : 'text-white'
          }`}
        >
          {notification.title}
        </p>
        <p className="text-outline text-xs mt-0.5 leading-snug">{notification.body}</p>
        <p className="text-outline/60 text-xs mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {!notification.read && (
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5"
          aria-label="Unread"
        />
      )}
    </div>
  )

  if (notification.link) {
    return (
      <Link href={notification.link} className="block">
        {inner}
      </Link>
    )
  }

  return inner
}

export default async function NotificationsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/auth')

  const user = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!user) redirect('/auth')

  let notifications: Awaited<ReturnType<typeof prisma.notification.findMany>> = []
  try {
    notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  } catch {
    // Notification table may not exist yet in this environment
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const todayStr = new Date().toDateString()
  const todayNotifications = notifications.filter(
    (n) => n.createdAt.toDateString() === todayStr
  )
  const earlierNotifications = notifications.filter(
    (n) => n.createdAt.toDateString() !== todayStr
  )

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 lg:ml-72 min-h-screen px-6 py-12 pb-20 lg:pb-12 max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl font-black tracking-tighter text-white mb-2">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <p className="text-outline text-sm">{unreadCount} unread</p>
              )}
            </div>
            <MarkAllReadButton hasUnread={unreadCount > 0} />
          </div>

          {notifications.length === 0 ? (
            <div className="bg-surface-container border border-outline-variant/10 rounded-2xl p-12 text-center">
              <div
                className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4"
                aria-hidden="true"
              >
                <span className="material-symbols-outlined text-outline text-2xl">
                  notifications_none
                </span>
              </div>
              <h3 className="text-white font-bold mb-2">No notifications yet</h3>
              <p className="text-outline text-sm max-w-sm mx-auto mb-6">
                Subscribe to specialists and start chatting to receive updates here.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-surface-container-lowest font-bold rounded-lg hover:bg-white/90 transition-colors text-sm"
              >
                Discover Specialists
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {todayNotifications.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-2 px-1">
                    Today
                  </h2>
                  <div className="space-y-0.5">
                    {todayNotifications.map((n) => (
                      <NotificationRow key={n.id} notification={n} />
                    ))}
                  </div>
                </section>
              )}

              {earlierNotifications.length > 0 && (
                <section>
                  <h2 className="text-xs font-bold text-outline uppercase tracking-widest mb-2 px-1">
                    Earlier
                  </h2>
                  <div className="space-y-0.5">
                    {earlierNotifications.map((n) => (
                      <NotificationRow key={n.id} notification={n} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
