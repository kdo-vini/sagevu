import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@prisma/client'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  body: string
  link?: string
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
    },
  })
}
