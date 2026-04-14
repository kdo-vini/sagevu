import Image from 'next/image'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'
import type { Message } from '@/types'

interface ChatMessageProps {
  message: Message
  specialistName?: string
  specialistAvatarUrl?: string | null
  userName?: string | null
  userAvatarUrl?: string | null
}

export function ChatMessage({
  message,
  specialistName,
  specialistAvatarUrl,
  userName,
  userAvatarUrl,
}: ChatMessageProps) {
  const isUser = message.role === 'USER'
  const displayName = isUser ? (userName ?? 'You') : (specialistName ?? 'AI')

  return (
    <div
      className={cn('flex gap-3 mb-6', isUser && 'flex-row-reverse')}
      role="listitem"
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high"
        aria-hidden="true"
      >
        {isUser ? (
          userAvatarUrl ? (
            <Image
              src={userAvatarUrl}
              alt=""
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container-highest">
              <span className="text-xs font-bold text-on-surface-variant">
                {(userName ?? 'Y')[0].toUpperCase()}
              </span>
            </div>
          )
        ) : specialistAvatarUrl ? (
          <Image
            src={specialistAvatarUrl}
            alt=""
            width={36}
            height={36}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary-container/20">
            <span className="text-xs font-bold text-primary">
              {(specialistName ?? 'A')[0].toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%] space-y-1', isUser && 'items-end flex flex-col')}>
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-gradient-to-br from-primary/20 to-primary-container/20 text-white border border-primary/20 rounded-tr-sm'
              : 'bg-surface-container border border-outline-variant/10 text-on-surface-variant rounded-tl-sm'
          )}
          aria-label={`${displayName}: ${message.content}`}
        >
          {message.content}
        </div>
        <time
          dateTime={message.createdAt}
          className="text-[10px] text-outline px-1"
        >
          {formatRelativeTime(new Date(message.createdAt))}
        </time>
      </div>
    </div>
  )
}
