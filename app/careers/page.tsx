'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Globe, Users, Heart, Zap, Coffee, Shield, Sparkles } from 'lucide-react'
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
  { icon: Globe, label: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: Zap, label: 'Equity', description: 'Own a piece of what you build' },
  { icon: Heart, label: 'Health', description: 'Comprehensive health coverage' },
  { icon: Coffee, label: 'Flexible Hours', description: 'Work on your own schedule' },
  { icon: Shield, label: 'Unlimited PTO', description: 'Take the time you need' },
  { icon: Users, label: 'Great Team', description: 'Work with talented people' },
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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--primary)/0.12,transparent_70%)]" />
        </div>
        
        <div className="mx-auto max-w-2xl px-6 pt-32 pb-14 sm:pt-40 sm:pb-16">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center">
            <PicturaIcon size={44} className="mx-auto mb-5" />
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
              <Sparkles className="h-3 w-3" />
              We&apos;re hiring
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Join Pictura
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
              Help us build the future of AI-powered creativity. We&apos;re a small, remote team based in Nigeria with big ambitions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 bg-secondary/20">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8"
          >
            {[
              { value: '10M+', label: 'Images Generated' },
              { value: '500K+', label: 'Creators' },
              { value: '100%', label: 'Remote Team' },
              { value: String(jobs.length), label: 'Open Roles' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-6 py-14 sm:py-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}>
            <h2 className="text-lg font-semibold text-foreground text-center mb-8">Why join us</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                variants={fadeUp}
                className="rounded-xl border border-border/50 bg-card p-4 sm:p-5 transition-colors hover:border-primary/20"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <perk.icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">{perk.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{perk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Department Filter */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex items-center justify-center gap-1 sm:gap-2 py-3 overflow-x-auto scrollbar-hide -mx-6 px-6">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  activeDepartment === dept
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            {activeDepartment === 'All' ? 'Open positions' : activeDepartment}
          </h2>
          <span className="text-xs text-muted-foreground">
            {filteredJobs.length} role{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="space-y-3">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
            >
              <Link href={`/careers/${job.id}`}>
                <article className="group rounded-xl border border-border/50 bg-card p-5 sm:p-6 transition-all hover:border-primary/30 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-primary uppercase tracking-wider">
                          {job.department}
                        </span>
                        <span className="hidden sm:inline h-1 w-1 rounded-full bg-border" />
                        <span className="hidden sm:inline text-xs text-muted-foreground">{job.type}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-border/50 bg-card">
            <p className="text-sm text-muted-foreground">
              No open positions in {activeDepartment} right now.
            </p>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-2xl px-6 py-14 sm:py-16">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            custom={0} 
            variants={fadeUp}
            className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 text-center"
          >
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Don&apos;t see your role?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <Link
              href="mailto:careers@picturaai.sbs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
