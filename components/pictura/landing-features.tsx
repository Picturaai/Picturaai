export function LandingFeatures() {
  return (
    <section className="relative py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-mono tracking-[0.25em] text-primary mb-3 block">
            CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            What Pictura can do
          </h2>
          <p className="mt-4 text-muted-foreground max-w-lg mx-auto text-pretty">
            Our model is constantly improving. Here is what you can do today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Text to Image */}
          <div className="group relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Text to Image</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Describe your vision in words, and Pictura brings it to life. From photorealistic scenes to abstract art, the only limit is your imagination.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Photorealistic', 'Abstract', 'Illustration'].map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Image to Image */}
          <div className="group relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
                <path d="m21 15-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Image to Image</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload any image and transform it with AI. Change styles, add elements, or completely reimagine your existing visuals.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Style Transfer', 'Enhancement', 'Remix'].map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* API Coming Soon */}
          <div className="group relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M8 9l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                <path d="M13 15h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-primary" />
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-primary" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              API
              <span className="ml-2 text-[10px] font-mono px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground border border-accent/30 align-middle">
                COMING SOON
              </span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Integrate Pictura directly into your applications. Our API will let developers generate images programmatically at scale.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['REST API', 'Webhooks', 'SDKs'].map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-secondary text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
