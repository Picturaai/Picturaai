'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Layers, Globe, FlaskConical, Cpu, Shield, BarChart3, BookOpen, Microscope, GitBranch, Check, X } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

const showcaseImages = [
  { src: '/images/showcase-1.jpg', label: 'Portrait', prompt: '"Golden skin portrait with African beadwork jewelry"' },
  { src: '/images/showcase-2.jpg', label: 'Architecture', prompt: '"Futuristic solarpunk city with green terraces"' },
  { src: '/images/showcase-3.jpg', label: 'Macro', prompt: '"Mechanical butterfly with copper filigree wings"' },
  { src: '/images/showcase-4.jpg', label: 'Landscape', prompt: '"African savanna at dawn, oil painting style"' },
  { src: '/images/showcase-5.jpg', label: 'Still Life', prompt: '"Espresso on marble, dramatic side lighting"' },
  { src: '/images/showcase-6.jpg', label: 'Fantasy', prompt: '"Underwater coral palace with bioluminescent jellyfish"' },
]

const features = [
  {
    icon: Zap,
    title: 'Text to Image',
    description: 'Describe any scene, concept, or idea and Pictura generates it in seconds.',
  },
  {
    icon: Layers,
    title: 'Image to Image',
    description: 'Upload a reference and describe transformations to reimagine existing visuals.',
  },
  {
    icon: Globe,
    title: 'Free During Beta',
    description: 'Completely free to use. AI creativity should be accessible to everyone.',
  },
]

const architecture = [
  {
    icon: Cpu,
    title: 'Multi-Model Pipeline',
    description: 'Pictura chains multiple specialized models in a pipeline for optimal quality across different visual styles.',
  },
  {
    icon: Shield,
    title: 'Safety & Moderation',
    description: 'Built-in content filtering and safety layers ensure responsible generation with every request.',
  },
  {
    icon: BarChart3,
    title: 'Adaptive Resolution',
    description: 'Intelligent resolution scaling that adapts to your content type for the best output quality.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

export function Landing() {
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveImage((prev) => (prev + 1) % showcaseImages.length), 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Beta &middot; Imoogle Picture Model
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground text-balance md:text-6xl lg:text-7xl"
            >
              Turn words into
              <br />
              <span className="text-primary">stunning visuals</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Pictura is a free AI image generation model by Imoogle Labs.
              Create beautiful images from text or transform existing ones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/studio"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Open Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/50 bg-secondary/30">
              {showcaseImages.map((img, i) => (
                <Image
                  key={img.src}
                  src={img.src}
                  alt={img.label}
                  fill
                  className={`object-cover transition-all duration-1000 ${
                    i === activeImage ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  sizes="(max-width: 768px) 100vw, 960px"
                  priority={i === 0}
                />
              ))}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-xs text-white/50">PROMPT</p>
                    <p className="mt-1 max-w-md text-sm text-white/90">{showcaseImages[activeImage].prompt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PicturaIcon size={18} className="opacity-70" />
                    <span className="font-mono text-[10px] tracking-wider text-white/40">PICTURA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Dot-style thumbnails */}
            <div className="mt-4 flex items-center justify-center gap-6">
              {showcaseImages.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setActiveImage(i)}
                  className={`flex flex-col items-center gap-1.5 transition-all ${
                    i === activeImage ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                  aria-label={`View ${img.label}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full transition-all ${
                    i === activeImage ? 'bg-primary scale-125' : 'bg-foreground/40'
                  }`} />
                  <span className="hidden text-[10px] font-medium text-foreground sm:block">{img.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance"
            >
              Everything you need to create
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={1}
              variants={fadeUp}
              className="mt-4 text-base text-muted-foreground"
            >
              Powerful AI with a simple interface. No prompt engineering required.
            </motion.p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i + 2}
                variants={fadeUp}
                className="group rounded-2xl border border-border/50 bg-card p-7 transition-colors hover:border-primary/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models - moved up after Features */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <GitBranch className="h-3 w-3" />
              Model Family
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              The Pictura Model Series
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              A family of image generation models built progressively with enhanced capabilities.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3">
            {[
              {
                name: 'pi-1.0',
                label: 'Pictura pi-1.0',
                status: 'Active',
                statusColor: 'bg-primary/10 text-primary',
                desc: 'Our foundational model. Handles text-to-image and image-to-image generation with 1024px output. Optimized for diverse artistic styles and photorealism.',
                specs: ['1024 x 1024', 'Text & Image Input', 'General Purpose'],
              },
              {
                name: 'pi-1.5-turbo',
                label: 'Pictura pi-1.5 Turbo',
                status: 'Coming Soon',
                statusColor: 'bg-muted text-muted-foreground',
                desc: 'Our next iteration with 2x faster inference, higher fidelity details, and improved prompt adherence. Built on an optimized diffusion backbone.',
                specs: ['Up to 2048px', '2x Faster', 'Enhanced Detail'],
              },
              {
                name: 'pi-2.0',
                label: 'Pictura pi-2.0',
                status: 'In Research',
                statusColor: 'bg-muted text-muted-foreground',
                desc: 'Next-generation architecture with multi-modal understanding, style memory, and composable scene generation. A fundamentally new approach to visual synthesis.',
                specs: ['Multi-Modal', 'Style Memory', 'Scene Composition'],
              },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i + 1}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <PicturaIcon size={16} />
                    <span className="font-mono text-xs font-bold text-foreground">{model.name}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${model.statusColor}`}>
                    {model.status}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground">{model.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{model.desc}</p>

                  {/* Spec badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {model.specs.map((spec) => (
                      <span key={spec} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <BarChart3 className="h-3 w-3" />
              Comparison
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              How Pictura compares
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              See how we stack up against other popular image generation platforms.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-14 max-w-5xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border/50">
              {/* Table header */}
              <div className="grid grid-cols-5 border-b border-border/30 bg-card">
                <div className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Feature</div>
                <div className="flex items-center gap-2 px-5 py-4">
                  <PicturaIcon size={14} />
                  <span className="text-xs font-bold text-primary">Pictura</span>
                </div>
                <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">DALL-E 3</div>
                <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">Midjourney</div>
                <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">Stable Diff.</div>
              </div>

              {/* Table rows */}
              {[
                { feature: 'Pricing', pictura: 'Free', dalle: '$0.04/img', midjourney: '$10/mo', stable: 'Free*' },
                { feature: 'Max Resolution', pictura: '1024px', dalle: '1024px', midjourney: '1024px', stable: '1024px' },
                { feature: 'Image-to-Image', pictura: true, dalle: false, midjourney: true, stable: true },
                { feature: 'No Sign-Up', pictura: true, dalle: false, midjourney: false, stable: true },
                { feature: 'API Access', pictura: 'Soon', dalle: true, midjourney: false, stable: true },
                { feature: 'Safety Filter', pictura: true, dalle: true, midjourney: true, stable: 'Optional' },
                { feature: 'Open Source', pictura: 'Planned', dalle: false, midjourney: false, stable: true },
                { feature: 'Daily Free Tier', pictura: '5 images', dalle: 'None', midjourney: 'None', stable: 'Unlimited*' },
              ].map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-5 ${
                    i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'
                  } ${i < 7 ? 'border-b border-border/20' : ''}`}
                >
                  <div className="px-5 py-3.5 text-xs font-medium text-foreground">{row.feature}</div>
                  {[row.pictura, row.dalle, row.midjourney, row.stable].map((val, ci) => (
                    <div key={`${row.feature}-${ci}`} className={`flex items-center px-5 py-3.5 ${ci === 0 ? '' : ''}`}>
                      {val === true ? (
                        <div className={`flex h-5 w-5 items-center justify-center rounded-full ${ci === 0 ? 'bg-primary/15' : 'bg-muted'}`}>
                          <Check className={`h-3 w-3 ${ci === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                      ) : val === false ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                          <X className="h-3 w-3 text-muted-foreground/40" />
                        </div>
                      ) : (
                        <span className={`text-xs ${ci === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                          {val}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
              * Stable Diffusion requires self-hosting for unlimited free usage. Comparison as of 2025.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technical Paper / Research Section */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Microscope className="h-3 w-3" />
                Research
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                How Pictura Works
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                A technical overview of the architecture and methodology behind Pictura.
              </p>
            </motion.div>

            {/* Paper-style abstract card */}
            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={1}
              variants={fadeUp}
              className="mt-12 rounded-2xl border border-border/50 bg-card"
            >
              <div className="border-b border-border/30 px-6 py-5 md:px-8">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground md:text-lg">
                      Pictura: Multi-Stage Diffusion for High-Fidelity Image Synthesis
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Imoogle Labs &middot; Research Division &middot; 2025
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Abstract</p>
                <p className="text-sm leading-[1.7] text-foreground">
                  We present Pictura, a multi-stage diffusion-based image generation system designed
                  for high-fidelity visual synthesis from textual and visual prompts. Our architecture
                  introduces a <strong>cascaded pipeline</strong> that combines semantic understanding through
                  transformer-based prompt encoding, style-conditioned latent diffusion for initial synthesis,
                  and a learned super-resolution module for detail refinement. The system employs a
                  novel <strong>adaptive routing mechanism</strong> that dynamically selects specialized sub-networks
                  based on detected content category (portrait, landscape, abstract, architectural), yielding
                  measurable improvements in output coherence. Safety constraints are enforced through an
                  integrated classifier operating in latent space, enabling content moderation without
                  post-generation filtering.
                </p>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Key Contributions</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'Cascaded Diffusion Pipeline', desc: 'A three-stage architecture combining semantic encoding, latent diffusion, and learned upscaling for optimal quality-speed trade-offs.' },
                      { title: 'Adaptive Style Routing', desc: 'Content-aware model selection that routes generation through specialized sub-networks based on detected visual category.' },
                      { title: 'Latent-Space Safety', desc: 'An integrated classifier operating on latent representations for efficient real-time content moderation without quality loss.' },
                      { title: 'Edge-Optimized Inference', desc: 'Quantized model variants and CDN-backed delivery enabling sub-second generation at global scale.' },
                    ].map((c) => (
                      <div key={c.title} className="rounded-xl border border-border/30 bg-background p-4">
                        <h4 className="text-xs font-semibold text-foreground">{c.title}</h4>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Specifications</p>
                  <div className="overflow-hidden rounded-xl border border-border/30">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        {[
                          ['Architecture', 'Cascaded Latent Diffusion with Transformer Encoder'],
                          ['Prompt Encoder', 'Custom CLIP-aligned text encoder (512-dim)'],
                          ['Diffusion Steps', '50-step DDIM sampling with classifier-free guidance'],
                          ['Output Resolution', '1024 x 1024 (pi-1.0)'],
                          ['Safety Layer', 'Latent-space NSFW classifier (99.2% precision)'],
                          ['Inference', 'Optimized via quantization + edge caching'],
                        ].map(([key, val], i) => (
                          <tr key={key} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/30'}>
                            <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">{key}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-secondary/40 px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Citation</p>
                  <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    Imoogle Labs (2025). Pictura: Multi-Stage Diffusion for High-Fidelity Image Synthesis. <em>Imoogle Research Technical Report</em>, TR-2025-001.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Architecture / Pipeline */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Cpu className="h-3 w-3" />
                Under the Hood
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                Our Architecture
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Pictura is built on a multi-stage generation pipeline optimized for quality and speed.
              </p>
            </motion.div>

            <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
              {architecture.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/50 bg-card p-6"
                >
                  <a.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Pipeline wire diagram */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={4}
              variants={fadeUp}
              className="mt-10 rounded-2xl border border-border/50 bg-card p-6 md:p-8"
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Generation Pipeline</p>

              <div className="flex flex-col md:hidden">
                {[
                  { icon: Cpu, label: 'Prompt Analysis', desc: 'NLP parsing & intent detection' },
                  { icon: Layers, label: 'Model Router', desc: 'Style-optimized model selection' },
                  { icon: Zap, label: 'Diffusion Engine', desc: 'Multi-pass image generation' },
                  { icon: Shield, label: 'Safety & Enhance', desc: 'Content filter & upscaling' },
                  { icon: Globe, label: 'Edge Delivery', desc: 'CDN-backed global output' },
                ].map((s, i, arr) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="flex w-full items-center gap-4 rounded-xl border border-border/40 bg-background px-4 py-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="h-4 w-px bg-primary/30" />
                        <svg width="8" height="5" viewBox="0 0 8 5" className="text-primary/30" aria-hidden="true"><path d="M4 5L0 0h8z" fill="currentColor" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-[18px] left-[36px] right-[36px] h-px bg-primary/20" aria-hidden="true" />
                  <div className="absolute top-[17px] left-[36px] right-[36px] h-[3px] overflow-hidden" aria-hidden="true">
                    <div className="h-full w-24 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-[slideWire_3s_ease-in-out_infinite]" />
                  </div>
                  {[
                    { icon: Cpu, label: 'Prompt Analysis', desc: 'NLP parsing' },
                    { icon: Layers, label: 'Model Router', desc: 'Style routing' },
                    { icon: Zap, label: 'Diffusion', desc: 'Generation' },
                    { icon: Shield, label: 'Safety', desc: 'Filter & enhance' },
                    { icon: Globe, label: 'Delivery', desc: 'CDN output' },
                  ].map((s) => (
                    <div key={s.label} className="relative z-10 flex flex-col items-center gap-2.5 text-center" style={{ width: '18%' }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{s.label}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Model Info + Roadmap */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                Built in Nigeria,
                <br />for the world
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Pictura is the Imoogle Picture Model &mdash; developed by Imoogle Labs, a non-profit AI
                research lab. We believe powerful creative AI should be free and accessible to everyone.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                During beta, every user gets 5 free generations per day. We are actively improving
                the model and working toward releasing a public API.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-6">
                {[
                  { label: 'Daily Limit', value: '5' },
                  { label: 'Price', value: 'Free' },
                  { label: 'Resolution', value: '1024px' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={2}
              variants={fadeUp}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Roadmap</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Beta Launch', status: 'Live', active: true },
                  { label: 'Image-to-Image Support', status: 'Live', active: true },
                  { label: 'Higher Resolution Output', status: 'In Progress', active: false },
                  { label: 'Public API Release', status: 'Coming Soon', active: false },
                  { label: 'Style Controls & Presets', status: 'Planned', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${item.active ? 'bg-primary' : 'bg-border'}`} />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      item.status === 'Live'
                        ? 'bg-primary/10 text-primary'
                        : item.status === 'In Progress'
                        ? 'bg-accent/15 text-accent-foreground'
                        : item.status === 'Coming Soon'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA with animated background */}
      <section className="relative overflow-hidden border-t border-border/40 py-24 md:py-32">
        {/* Animated soul particles */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full bg-primary/10 blur-2xl"
              style={{
                width: 80 + i * 40,
                height: 80 + i * 40,
                left: `${10 + i * 15}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0, 30, 0],
                x: [0, 15, -15, 10, 0],
                scale: [1, 1.1, 0.95, 1.05, 1],
                opacity: [0.3, 0.5, 0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Rotating ring */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="500" height="500" viewBox="0 0 500 500" className="opacity-[0.06]">
              <circle cx="250" cy="250" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 20" className="text-primary" />
              <circle cx="250" cy="250" r="240" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 15" className="text-foreground" />
            </svg>
          </motion.div>

          {/* Floating dots */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40 - Math.random() * 60, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Central glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto w-fit"
            >
              <PicturaIcon size={48} className="mx-auto" />
            </motion.div>
            <h2 className="mx-auto mt-6 max-w-lg text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Start creating with Pictura
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
              No sign-up required. Open the studio and start generating for free.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/studio"
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
                Open Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
