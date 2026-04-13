'use client'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled,
  placeholder = 'Send a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSend() {
    const trimmed = message.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setMessage('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setMessage(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const canSend = message.trim().length > 0 && !disabled

  return (
    <div className="border-t border-outline-variant/20 bg-surface-container-low p-4">
      <div className="flex items-end gap-3 bg-surface-container-high border border-outline-variant/30 rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-colors duration-200">
        <label htmlFor="chat-input" className="sr-only">
          Message
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message"
          className="flex-1 bg-transparent text-on-surface text-sm placeholder:text-outline resize-none outline-none leading-relaxed max-h-40 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
            canSend
              ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:scale-110 active:scale-95'
              : 'bg-surface-container-highest text-outline cursor-not-allowed'
          )}
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">
            send
          </span>
        </button>
      </div>
      <p className="text-outline text-[10px] text-center mt-2" aria-hidden="true">
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
