'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { GeneratedImage } from '@/lib/types'

interface ImageGalleryProps {
  images: GeneratedImage[]
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-muted-foreground/50"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">No images yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Your generated images will appear here
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-1">
        {images.map((image, index) => (
          <button
            key={`${image.createdAt}-${index}`}
            type="button"
            onClick={() => setSelectedImage(image)}
            className="group relative overflow-hidden rounded-xl border border-border bg-card cursor-pointer hover:border-primary/30 transition-all hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={image.url}
                alt={image.prompt}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-xs text-card line-clamp-2 text-left">
                {image.prompt}
              </p>
              <Badge
                variant="secondary"
                className="mt-1.5 text-[10px] bg-card/20 text-card border-card/20"
              >
                {image.type === 'text-to-image' ? 'Text to Image' : 'Image to Image'}
              </Badge>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="relative max-w-3xl w-full bg-card rounded-2xl overflow-hidden shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 z-10 size-8 rounded-full bg-foreground/80 text-card flex items-center justify-center hover:bg-foreground transition-colors"
              aria-label="Close preview"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <img
              src={selectedImage.url}
              alt={selectedImage.prompt}
              className="w-full max-h-[70vh] object-contain bg-secondary/30"
            />
            <div className="p-5 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-[10px] border-primary/20 text-primary"
                >
                  {selectedImage.type === 'text-to-image'
                    ? 'Text to Image'
                    : 'Image to Image'}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(selectedImage.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {selectedImage.prompt}
              </p>
              <a
                href={selectedImage.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download full resolution
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
