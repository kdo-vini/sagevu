'use client'
import { useState, useRef, useCallback } from 'react'

const MAX_VIDEO_MB = 50
const MAX_VIDEO_BYTES = MAX_VIDEO_MB * 1024 * 1024

interface VideoUploadProps {
  value: string
  onChange: (url: string) => void
  folder?: string
}

export function VideoUpload({ value, onChange, folder = 'posts' }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = useCallback(
    async (file: File) => {
      if (file.type !== 'video/mp4') {
        setError('Only MP4 videos are supported')
        return
      }
      if (file.size > MAX_VIDEO_BYTES) {
        setError(`Video must be under ${MAX_VIDEO_MB} MB`)
        return
      }

      setUploading(true)
      setProgress(0)
      setError('')

      try {
        const form = new FormData()
        form.append('file', file)
        form.append('folder', folder)

        // XHR for upload progress tracking
        const { publicUrl } = await new Promise<{ publicUrl: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText) as { publicUrl: string })
            } else {
              try {
                const err = JSON.parse(xhr.responseText) as { error?: string }
                reject(new Error(err.error ?? 'Upload failed'))
              } catch {
                reject(new Error('Upload failed'))
              }
            }
          }
          xhr.onerror = () => reject(new Error('Upload failed'))
          xhr.open('POST', '/api/upload')
          xhr.send(form)
        })

        onChange(publicUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [folder, onChange]
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void upload(file)
  }

  function handleRemove() {
    onChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        <video src={value} controls className="w-full h-full object-contain" />
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 border border-white/20 flex items-center justify-center hover:bg-error transition-colors"
          aria-label="Remove video"
        >
          <span className="material-symbols-outlined text-white text-sm">close</span>
        </button>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4"
        className="hidden"
        onChange={handleChange}
        aria-label="Upload video"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full rounded-xl border-2 border-dashed border-outline-variant/30 bg-surface-container-high hover:border-primary/50 hover:bg-primary/5 transition-all p-6 flex flex-col items-center gap-2 group disabled:opacity-60"
      >
        {uploading ? (
          <>
            <span className="material-symbols-outlined text-primary text-2xl animate-pulse">video_file</span>
            <span className="text-outline text-sm">Uploading {progress}%...</span>
            <div className="w-full max-w-xs bg-surface-container rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-outline text-2xl group-hover:text-primary transition-colors">video_file</span>
            <span className="text-outline text-sm group-hover:text-on-surface-variant transition-colors">
              Add video <span className="text-xs">(MP4, max {MAX_VIDEO_MB} MB)</span>
            </span>
          </>
        )}
      </button>
      {error && (
        <p className="text-error text-xs mt-2 flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">error</span>
          {error}
        </p>
      )}
    </div>
  )
}
