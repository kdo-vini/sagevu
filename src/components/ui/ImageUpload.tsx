'use client'
import { useState, useRef, useCallback } from 'react'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  aspect?: 'square' | 'cover'
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  label = 'Upload Image',
  aspect = 'square',
  className = '',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const aspectClasses =
    aspect === 'cover'
      ? 'w-full h-40 rounded-xl'
      : 'w-28 h-28 rounded-xl'

  const upload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File must be under 10 MB')
        return
      }

      setUploading(true)
      setError('')

      try {
        const form = new FormData()
        form.append('file', file)
        form.append('folder', folder)

        const res = await fetch('/api/upload', { method: 'POST', body: form })

        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          throw new Error(data.error ?? 'Upload failed')
        }

        const { publicUrl } = (await res.json()) as { publicUrl: string }
        onChange(publicUrl)
      } catch (err) {
        console.error('Upload error:', err)
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
      }
    },
    [folder, onChange]
  )

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void upload(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) void upload(file)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label={label}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading}
        className={`
          relative overflow-hidden ${aspectClasses}
          border-2 border-dashed transition-all cursor-pointer
          flex items-center justify-center group
          ${dragOver
            ? 'border-primary bg-primary/10'
            : value
              ? 'border-transparent'
              : 'border-outline-variant/30 bg-surface-container-high hover:border-outline-variant/50'
          }
          ${uploading ? 'opacity-60 pointer-events-none' : ''}
        `}
        aria-label={label}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="text-white text-xs font-bold">Change</span>
              <button
                type="button"
                onClick={handleRemove}
                className="w-7 h-7 rounded-full bg-error/80 flex items-center justify-center hover:bg-error transition-colors"
                aria-label="Remove image"
              >
                <span
                  className="material-symbols-outlined text-white text-sm"
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            </div>
          </>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-xl animate-spin"
              aria-hidden="true"
            >
              progress_activity
            </span>
            <span className="text-outline text-xs">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span
              className="material-symbols-outlined text-outline text-xl group-hover:text-primary transition-colors"
              aria-hidden="true"
            >
              add_photo_alternate
            </span>
            <span className="text-outline text-xs group-hover:text-on-surface-variant transition-colors">
              {label}
            </span>
          </div>
        )}
      </button>

      {error && (
        <p className="text-error text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs" aria-hidden="true">
            error
          </span>
          {error}
        </p>
      )}
    </div>
  )
}
