export type SpecialistType = 'HUMAN' | 'AI'
export type PostVisibility = 'PUBLIC' | 'SUBSCRIBERS_ONLY'
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'INCOMPLETE'
export type MessageRole = 'USER' | 'ASSISTANT'

export interface Specialist {
  id: string
  creatorId: string
  name: string
  slug: string
  bio?: string | null
  avatarUrl?: string | null
  coverUrl?: string | null
  type: SpecialistType
  specialty?: string | null
  tagline?: string | null
  isPublished: boolean
  subscriptionPrice: number
  currency: string
  stripePriceId?: string | null
  createdAt: string
  updatedAt: string
  creator?: { name?: string | null; avatarUrl?: string | null }
}

export interface Post {
  id: string
  specialistId: string
  content: string
  mediaUrls: string[]
  visibility: PostVisibility
  /** True when the post is SUBSCRIBERS_ONLY and the viewer has no active subscription. Content and mediaUrls are empty strings/arrays when locked. */
  locked?: boolean
  createdAt: string
  updatedAt: string
  specialist?: Pick<Specialist, 'name' | 'avatarUrl' | 'slug'>
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  specialistId: string
  subscriberId: string
  createdAt: string
  messages?: Message[]
}

export type NotificationType =
  | 'NEW_SUBSCRIBER'
  | 'SUBSCRIBER_CANCELED'
  | 'NEW_MESSAGE'
  | 'POST_PUBLISHED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'PAYOUT_PROCESSED'
  | 'PAYOUT_FAILED'
  | 'CONTENT_REPORTED'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  link: string | null
  read: boolean
  createdAt: string
}
