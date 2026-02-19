export function BetaBanner() {
  return (
    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3">
      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-primary">
          <path
            d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">
          Pictura is in Beta
        </span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We are actively working on improving Pictura. During beta, image generation
          is limited to <strong className="text-foreground">5 images per day</strong> per
          user. Quality and speed will continue to improve as we refine the model.
          Thank you for being an early tester!
        </p>
      </div>
    </div>
  )
}
