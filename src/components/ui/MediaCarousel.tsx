'use client'
import { useState } from 'react'
import Image from 'next/image'

interface MediaCarouselProps {
  images: string[]
  videoUrl?: string
}

export function MediaCarousel({ images, videoUrl }: MediaCarouselProps) {
  const [index, setIndex] = useState(0)
  const total = images.length + (videoUrl ? 1 : 0)

  if (total === 0) return null

  // Single image, no controls needed
  if (total === 1 && images.length === 1) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-surface-container-highest aspect-video mt-3">
        <Image src={images[0]} alt="" fill className="object-cover" />
      </div>
    )
  }

  // Single video
  if (total === 1 && videoUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video mt-3">
        <video src={videoUrl} controls className="w-full h-full object-contain" />
      </div>
    )
  }

  // 2 images side by side
  if (total === 2 && images.length === 2 && !videoUrl) {
    return (
      <div className="grid grid-cols-2 gap-1 rounded-xl overflow-hidden mt-3">
        {images.map((url, i) => (
          <div key={i} className="relative bg-surface-container-highest aspect-square">
            <Image src={url} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    )
  }

  // 3+ items — full carousel
  const allMedia = [...images, ...(videoUrl ? ['__video__'] : [])]
  const current = allMedia[index]

  return (
    <div className="relative mt-3 rounded-xl overflow-hidden bg-surface-container-highest">
      {/* Main display */}
      <div className="relative aspect-video">
        {current === '__video__' ? (
          <video src={videoUrl} controls className="w-full h-full object-contain bg-black" />
        ) : (
          <Image src={current} alt="" fill className="object-cover" />
        )}

        {/* Arrow controls */}
        {index > 0 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-white text-sm">chevron_left</span>
          </button>
        )}
        {index < total - 1 && (
          <button
            type="button"
            onClick={() => setIndex((i) => i + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center hover:bg-black/80 transition-colors"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-white text-sm">chevron_right</span>
          </button>
        )}

        {/* Counter badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {index + 1}/{total}
        </div>
      </div>

      {/* Dot / thumbnail strip */}
      {total <= 6 && (
        <div className="flex items-center justify-center gap-1.5 py-2 px-3">
          {allMedia.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${url === '__video__' ? 'video' : `image ${i + 1}`}`}
              className={`transition-all rounded-full ${
                i === index
                  ? 'w-4 h-1.5 bg-primary'
                  : 'w-1.5 h-1.5 bg-outline/40 hover:bg-outline'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
