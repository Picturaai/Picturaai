import { Badge } from '@/components/ui/badge'

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-8 pb-10 lg:pt-12 lg:pb-14">
      <Badge
        variant="outline"
        className="mb-5 border-primary/20 bg-primary/5 text-primary font-medium text-xs px-3 py-1 rounded-full"
      >
        <span className="inline-block size-1.5 rounded-full bg-primary animate-pulse mr-1.5" />
        Beta Preview - Limited Access
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground text-balance max-w-3xl leading-[1.1]">
        Create stunning images
        <br />
        <span className="text-primary">with Pictura AI</span>
      </h1>
      <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl text-pretty leading-relaxed">
        Transform your ideas into beautiful images. Generate from text descriptions
        or reimagine existing images with our AI model.
      </p>
      <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Text to Image</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Image to Image</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>5 generations / day</span>
        </div>
      </div>
    </section>
  )
}
