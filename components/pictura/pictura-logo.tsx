export function PicturaIcon({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Abstract paintbrush stroke forming a "P" shape */}
      <circle cx="32" cy="32" r="30" fill="url(#pictura-bg)" />
      <path
        d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4"
        stroke="url(#pictura-stroke)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Artistic dot accent */}
      <circle cx="44" cy="20" r="3" fill="url(#pictura-accent)" />
      <defs>
        <linearGradient id="pictura-bg" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#C87941" />
          <stop offset="1" stopColor="#A0522D" />
        </linearGradient>
        <linearGradient id="pictura-stroke" x1="22" y1="18" x2="44" y2="46">
          <stop stopColor="#FFF8F0" />
          <stop offset="1" stopColor="#F5E6D3" />
        </linearGradient>
        <linearGradient id="pictura-accent" x1="41" y1="17" x2="47" y2="23">
          <stop stopColor="#FFD700" />
          <stop offset="1" stopColor="#FFA500" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function PicturaWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-sans font-bold tracking-tight ${className}`}>
      Pictura
    </span>
  )
}

export function PicturaWatermark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 opacity-60 ${className}`}>
      <PicturaIcon size={14} />
      <span className="text-[10px] font-mono tracking-wider text-foreground/50">
        PICTURA
      </span>
    </div>
  )
}
