'use client'
import { useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

interface MarkdownEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  maxLength?: number
  preview?: boolean
}

type ToolbarAction = {
  label: string
  icon: string
  action: (text: string, selStart: number, selEnd: number) => { newText: string; newSel: number }
}

const TOOLBAR: ToolbarAction[] = [
  {
    label: 'Bold',
    icon: 'format_bold',
    action: (text, s, e) => {
      const sel = text.slice(s, e) || 'bold text'
      const before = text.slice(0, s)
      const after = text.slice(e)
      return { newText: `${before}**${sel}**${after}`, newSel: s + 2 + sel.length + 2 }
    },
  },
  {
    label: 'Italic',
    icon: 'format_italic',
    action: (text, s, e) => {
      const sel = text.slice(s, e) || 'italic text'
      const before = text.slice(0, s)
      const after = text.slice(e)
      return { newText: `${before}*${sel}*${after}`, newSel: s + 1 + sel.length + 1 }
    },
  },
  {
    label: 'Heading',
    icon: 'title',
    action: (text, s) => {
      const lineStart = text.lastIndexOf('\n', s - 1) + 1
      const before = text.slice(0, lineStart)
      const rest = text.slice(lineStart)
      const newText = `${before}## ${rest}`
      return { newText, newSel: s + 3 }
    },
  },
  {
    label: 'Bullet list',
    icon: 'format_list_bulleted',
    action: (text, s, e) => {
      const sel = text.slice(s, e)
      const lines = sel ? sel.split('\n').map((l) => `- ${l}`).join('\n') : '- List item'
      const before = text.slice(0, s)
      const after = text.slice(e)
      const prefix = before && !before.endsWith('\n') ? '\n' : ''
      return { newText: `${before}${prefix}${lines}\n${after}`, newSel: s + prefix.length + lines.length + 1 }
    },
  },
  {
    label: 'Numbered list',
    icon: 'format_list_numbered',
    action: (text, s, e) => {
      const sel = text.slice(s, e)
      const lines = sel
        ? sel.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')
        : '1. List item'
      const before = text.slice(0, s)
      const after = text.slice(e)
      const prefix = before && !before.endsWith('\n') ? '\n' : ''
      return { newText: `${before}${prefix}${lines}\n${after}`, newSel: s + prefix.length + lines.length + 1 }
    },
  },
  {
    label: 'Divider',
    icon: 'horizontal_rule',
    action: (text, s) => {
      const before = text.slice(0, s)
      const after = text.slice(s)
      const prefix = before && !before.endsWith('\n') ? '\n' : ''
      const insert = `${prefix}---\n`
      return { newText: `${before}${insert}${after}`, newSel: s + insert.length }
    },
  },
]

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your post...',
  maxLength = 5000,
  preview = false,
}: MarkdownEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)

  const applyAction = useCallback(
    (action: ToolbarAction['action']) => {
      const ta = taRef.current
      if (!ta) return
      const { selectionStart: s, selectionEnd: e } = ta
      const { newText, newSel } = action(value, s, e)
      onChange(newText)
      // Restore focus + cursor after state update
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(newSel, newSel)
      })
    },
    [value, onChange]
  )

  if (preview) {
    return (
      <div className="prose-dark min-h-[160px] text-on-surface-variant text-sm leading-relaxed">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="text-white text-xl font-black mb-3 mt-4">{children}</h1>,
            h2: ({ children }) => <h2 className="text-white text-lg font-bold mb-2 mt-3">{children}</h2>,
            h3: ({ children }) => <h3 className="text-white text-base font-bold mb-2 mt-3">{children}</h3>,
            strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
            em: ({ children }) => <em className="text-on-surface-variant italic">{children}</em>,
            ul: ({ children }) => <ul className="list-none space-y-1 my-3 pl-0">{children}</ul>,
            ol: ({ children }) => <ol className="list-none space-y-1 my-3 pl-0 counter-reset-[li]">{children}</ol>,
            li: ({ children, ...props }) => {
              const isOrdered = (props as { ordered?: boolean }).ordered
              return (
                <li className={`flex gap-2 text-on-surface-variant text-sm ${isOrdered ? '' : ''}`}>
                  <span className="text-primary flex-shrink-0 font-bold">{isOrdered ? '→' : '•'}</span>
                  <span>{children}</span>
                </li>
              )
            },
            p: ({ children }) => <p className="mb-3 text-on-surface-variant text-sm leading-relaxed">{children}</p>,
            hr: () => <hr className="border-outline-variant/20 my-4" />,
            code: ({ children }) => (
              <code className="bg-surface-container-highest text-primary px-1.5 py-0.5 rounded text-xs font-mono">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary/40 pl-4 my-3 text-outline italic">
                {children}
              </blockquote>
            ),
          }}
        >
          {value}
        </ReactMarkdown>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-outline-variant/20 bg-surface-container-high overflow-hidden focus-within:border-primary/50 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-outline-variant/15 flex-wrap">
        {TOOLBAR.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={() => applyAction(item.action)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
          </button>
        ))}
        <span className="ml-auto text-outline text-xs">
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        ref={taRef}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        rows={10}
        className="w-full bg-transparent px-4 py-3 text-on-surface-variant text-sm leading-relaxed resize-none outline-none placeholder:text-outline font-mono"
        aria-label="Post content"
      />
    </div>
  )
}
