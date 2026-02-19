export interface GeneratedImage {
  url: string
  prompt: string
  type: 'text-to-image' | 'image-to-image'
  sourceImageUrl?: string
  createdAt: string
}

export interface RateLimitInfo {
  limit: number
  remaining: number
  used: number
  resetAt: string
}
