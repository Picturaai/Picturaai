'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Globe, Rocket, Heart, Users } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Growth', 'Content']

const jobs = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build the core infrastructure powering Pictura AI. Work on distributed systems, ML pipelines, and real-time image generation at scale.',
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'Transform raw data into actionable insights. Help us understand user behavior, model performance, and business metrics.',
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Shape the visual identity of Pictura. Create stunning marketing assets, product illustrations, and brand materials.',
  },
  {
    id: 'video-animator',
    title: 'Video Animator',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Create compelling motion graphics and animations. Bring our AI-generated content to life through video storytelling.',
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    description: 'Own our social presence across all platforms. Build community, drive engagement, and amplify the Pictura brand globally.',
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'Content',
    location: 'Remote',
    type: 'Full-time',
    description: 'Write compelling content that educates and inspires. From blog posts to documentation, help users get the most from Pictura.',
  },
  {
    id: 'partner-growth-manager',
    title: 'Partner Growth Manager',
    department: 'Growth',
    location: 'Remote',
    type: 'Full-time',
    description: 'Build strategic partnerships that expand our reach. Work with creators, brands, and platforms to grow the Pictura ecosystem.',
  },
]

const perks = [
  { icon: Globe, title: 'Remote First', desc: 'Work from anywhere in the world' },
  { icon: Rocket, title: 'Ownership', desc: 'Take real ownership of your work' },
  { icon: Heart, title: 'Growth', desc: 'Learn alongside talented people' },
  { icon: Users, title: 'Impact', desc: 'Build something meaningful' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function CareersPage() {
  const [activeDepartment, setActiveDepartment] = useState('All')

  const filteredJobs = jobs.filter(
    job => activeDepartment === 'All' || job.department === activeDepartment
  )

  return (
    <>
      <Navbar />
      <main>
        {/* Hero with gradient background */}
        <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
          {/* Background glow like landing page */}
          <div className="absolute inset-0 -z-10 bg-background">
            <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--primary)/0.12,transparent_70%)]" />
            <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-primary/8 blur-[80px]" />
            <div className="absolute -right-32 top-32 h-64 w-64 rounded-full bg-primary/6 blur-[80px]" />
          </div>

          <div className="mx-auto max-w-2xl px-6 text-center">
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
              <PicturaIcon size={40} className="mx-auto" />
              <p className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                We&apos;re hiring
              </p>
              <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Join{' '}
                <span className="relative">
                  <span className="text-primary">Pictura</span>
                  {/* Curved underline */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 100 8"
                    preserveAspectRatio="none"
                    fill="none"
                  >
                    <path
                      d="M0 7 Q25 0 50 4 T100 2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="text-primary/50"
                    />
                  </svg>
                </span>
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Help us build the future of AI-powered creativity. We&apos;re a small, remote team based in Nigeria with big ambitions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats - Infographic Style */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-6">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connecting line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent hidden sm:block" />
              
              <div className="grid grid-cols-2 gap-8 sm:gap-12">
                {/* Images Generated */}
                <motion.div custom={0} variants={fadeUp} className="relative flex flex-col items-end text-right sm:pr-10">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">10K+</p>
                  <p className="text-xs text-muted-foreground mt-1">Images Generated</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-primary/60 to-primary/20 ml-auto" />
                </motion.div>

                {/* Creators */}
                <motion.div custom={1} variants={fadeUp} className="relative flex flex-col items-start text-left sm:pl-10">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">3K+</p>
                  <p className="text-xs text-muted-foreground mt-1">Active Creators</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-l from-primary/60 to-primary/20" />
                </motion.div>

                {/* Remote */}
                <motion.div custom={2} variants={fadeUp} className="relative flex flex-col items-end text-right sm:pr-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground mt-1">Remote Team</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-r from-primary/60 to-primary/20 ml-auto" />
                </motion.div>

                {/* Open Roles */}
                <motion.div custom={3} variants={fadeUp} className="relative flex flex-col items-start text-left sm:pl-10">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{jobs.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Open Roles</p>
                  <div className="mt-2 h-1 w-12 rounded-full bg-gradient-to-l from-primary/60 to-primary/20" />
                </motion.div>
              </div>

              {/* Center dot decoration */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block">
                <div className="h-3 w-3 rounded-full bg-primary/30 ring-4 ring-primary/10" />
              </div>
            </motion.div>
          </div>
        </section>

        <div className="mx-auto max-w-2xl px-6">
          {/* Why Join - centered, clean */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={1} 
            variants={fadeUp} 
            className="py-14 text-center"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Why join{' '}
              <span className="relative inline-block">
                <span className="text-primary">us</span>
                <svg
                  className="absolute -bottom-0.5 left-0 w-full"
                  viewBox="0 0 40 6"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0 5 Q10 0 20 3 T40 1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    className="text-primary/50"
                  />
                </svg>
              </span>
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {perks.map((perk, i) => (
                <motion.div 
                  key={perk.title}
                  custom={i + 1}
                  variants={fadeUp}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <perk.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="relative mt-3 inline-block text-sm font-semibold text-foreground">
                    {perk.title}
                    <svg
                      className="absolute -bottom-0.5 left-0 w-full"
                      viewBox="0 0 60 4"
                      preserveAspectRatio="none"
                      fill="none"
                    >
                      <path
                        d="M0 3 Q15 0 30 2 T60 1"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        className="text-primary/30"
                      />
                    </svg>
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{perk.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <div className="h-px bg-border/50" />

          {/* Filter */}
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={2} 
            variants={fadeUp} 
            className="py-8"
          >
            <div className="flex flex-wrap items-center gap-2">
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setActiveDepartment(dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeDepartment === dept
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Job Listings */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={3} 
            variants={fadeUp}
            className="pb-14"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Open positions</h2>
              <span className="text-xs text-muted-foreground">{filteredJobs.length} role{filteredJobs.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-2">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.03 }}
                >
                  <Link href={`/careers/${job.id}`}>
                    <article className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-primary/20 hover:bg-card/80">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{job.department}</span>
                            <span className="h-0.5 w-0.5 rounded-full bg-border" />
                            <span className="text-[10px] text-muted-foreground">{job.type}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">{job.description}</p>
                          <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-10 rounded-xl border border-border/50 bg-card">
                <p className="text-sm text-muted-foreground">No open positions in {activeDepartment} right now.</p>
              </div>
            )}
          </motion.section>

          <div className="h-px bg-border/50" />

          {/* CTA - simple, no card */}
          <motion.section 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={4} 
            variants={fadeUp} 
            className="py-14 text-center"
          >
            <h2 className="text-lg font-semibold text-foreground">Don&apos;t see your role?</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind.
            </p>
            <Link
              href="mailto:careers@picturaai.sbs"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Get in touch
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}
