'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Clock, ImageIcon, Cpu, Award, ChevronRight, Hourglass, Rocket } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const MODELS = [
  {
    id: 'pi-1.0',
    name: 'pi-1.0',
    tagline: 'Foundation Model',
    description: 'Our original model that started it all. Great for general-purpose image generation with reliable quality and consistency.',
    status: 'active',
    badge: null,
    speed: '~15s',
    resolution: '1024x1024',
    quality: 'High',
    features: [
      'General purpose generation',
      'Consistent results',
      'Wide style range',
      'Good prompt adherence',
    ],
    sample: '/images/model-sample-pi10.jpg',
    samplePrompt: 'Mountain landscape at golden hour with reflective lake',
  },
  {
    id: 'pi-1.5-turbo',
    name: 'pi-1.5-turbo',
    tagline: 'Speed & Quality',
    description: 'Our latest and most powerful model. 2x faster with enhanced detail, better prompt understanding, and higher resolution support.',
    status: 'active',
    badge: 'NEW',
    speed: '~8s',
    resolution: '2048x2048',
    quality: 'Ultra',
    features: [
      '2x faster generation',
      'Enhanced detail & clarity',
      'Better prompt adherence',
      'Higher resolution output',
      'Improved color accuracy',
      'Advanced style control',
    ],
    sample: '/images/model-sample-turbo.jpg',
    samplePrompt: 'Hyperrealistic mountain landscape, 8K quality, award winning',
  },
  {
    id: 'pi-2.0',
    name: 'pi-2.0',
    tagline: 'Next Generation',
    description: 'Our upcoming flagship model with groundbreaking architecture for unprecedented image quality and creative control.',
    status: 'coming',
    badge: 'COMING SOON',
    speed: '~5s',
    resolution: '4096x4096',
    quality: 'Ultimate',
    features: [
      'Revolutionary architecture',
      'Photorealistic output',
      'Advanced editing controls',
      '4K resolution support',
      'Multi-image generation',
      'Style mixing',
    ],
    sample: null,
    samplePrompt: null,
  },
]

const COMPARISON = [
  { feature: 'Generation Speed', pi10: '~15 seconds', turbo: '~8 seconds', pi20: '~5 seconds' },
  { feature: 'Max Resolution', pi10: '1024x1024', turbo: '2048x2048', pi20: '4096x4096' },
  { feature: 'Detail Level', pi10: 'High', turbo: 'Ultra', pi20: 'Ultimate' },
  { feature: 'Prompt Adherence', pi10: 'Good', turbo: 'Excellent', pi20: 'Perfect' },
  { feature: 'Style Range', pi10: 'Wide', turbo: 'Wider', pi20: 'Unlimited' },
  { feature: 'Color Accuracy', pi10: 'Good', turbo: 'Excellent', pi20: 'Perfect' },
]

export default function ModelsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Cpu className="h-4 w-4" />
              AI Models
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5 text-balance">
              Powerful Models for Every Need
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Choose the perfect AI model for your creative vision. From fast iterations to ultra-high quality output.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Try in Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#comparison"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-secondary transition-colors"
              >
                Compare Models
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Models Grid */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8">
            {MODELS.map((model, i) => (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative overflow-hidden rounded-2xl border ${
                  model.status === 'coming' 
                    ? 'border-dashed border-border/60 bg-card/50' 
                    : model.badge === 'NEW'
                    ? 'border-primary/30 bg-card'
                    : 'border-border/40 bg-card'
                }`}
              >
                {model.badge && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      model.badge === 'NEW' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {model.badge}
                    </span>
                  </div>
                )}

                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Info Section */}
                  <div className="p-5 sm:p-6 lg:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        model.status === 'coming' ? 'bg-secondary' : 'bg-primary/10'
                      }`}>
                        <PicturaIcon size={20} className={model.status === 'coming' ? 'text-muted-foreground' : 'text-primary'} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{model.name}</h2>
                        <p className="text-xs text-muted-foreground">{model.tagline}</p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                      {model.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">{model.speed}</p>
                        <p className="text-[10px] text-muted-foreground">Speed</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <ImageIcon className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">{model.resolution}</p>
                        <p className="text-[10px] text-muted-foreground">Resolution</p>
                      </div>
                      <div className="text-center p-3 rounded-xl bg-secondary/50">
                        <Award className="h-4 w-4 text-primary mx-auto mb-1" />
                        <p className="text-sm font-semibold text-foreground">{model.quality}</p>
                        <p className="text-[10px] text-muted-foreground">Quality</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-1.5 mb-5">
                      {model.features.slice(0, 4).map((feature, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Check className={`h-3.5 w-3.5 ${model.status === 'coming' ? 'text-muted-foreground' : 'text-primary'}`} />
                          <span className="text-xs text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {model.status === 'active' && (
                      <Link
                        href="/studio"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Use {model.name}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                    {model.status === 'coming' && (
                      <button
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-semibold cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>

                  {/* Sample Image */}
                  <div className="relative min-h-[250px] lg:min-h-full">
                    {model.sample ? (
                      <>
                        <Image
                          src={model.sample}
                          alt={`${model.name} sample output`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <p className="text-[10px] text-white/70 mb-0.5">Sample prompt:</p>
                          <p className="text-xs text-white font-medium line-clamp-2">{model.samplePrompt}</p>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                        <div className="text-center">
                          <Hourglass className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Sample coming soon</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="py-16 sm:py-24 border-t border-border/40 bg-card/50">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Model Comparison
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See how our models stack up against each other
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-4">
                    <span className="text-sm font-semibold text-foreground">pi-1.0</span>
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                      pi-1.5-turbo
                      <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px]">NEW</span>
                    </span>
                  </th>
                  <th className="text-center py-4 px-4">
                    <span className="text-sm font-semibold text-muted-foreground">pi-2.0</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0">
                    <td className="py-4 px-4 text-sm text-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center text-sm text-muted-foreground">{row.pi10}</td>
                    <td className="py-4 px-4 text-center text-sm font-medium text-primary">{row.turbo}</td>
                    <td className="py-4 px-4 text-center text-sm text-muted-foreground/60">{row.pi20}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center rounded-2xl bg-primary/5 border border-primary/20 p-8 sm:p-12">
            <Rocket className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Create?
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Start generating stunning images with our AI models. Free to use during beta.
            </p>
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors text-lg"
            >
              Open Studio
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
