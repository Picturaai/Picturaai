'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Globe, Users, Heart, Zap, Coffee, Shield } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

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
  { icon: Globe, label: 'Remote First', description: 'Work from anywhere' },
  { icon: Zap, label: 'Equity', description: 'Own what you build' },
  { icon: Heart, label: 'Health', description: 'Full coverage' },
  { icon: Coffee, label: 'Flexible', description: 'Your schedule' },
  { icon: Shield, label: 'PTO', description: 'Unlimited leave' },
  { icon: Users, label: 'Team', description: 'Great people' },
]

export default function CareersPage() {
  const [activeDepartment, setActiveDepartment] = useState('All')

  const filteredJobs = jobs.filter(
    job => activeDepartment === 'All' || job.department === activeDepartment
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:pt-36 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-5">
              We are hiring
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Join Pictura
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
              Help us build the future of AI-powered creativity. We are a small, remote team with big ambitions.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <div className="border-b border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="grid grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: '10M+', label: 'Images' },
              { value: '500K+', label: 'Creators' },
              { value: '100%', label: 'Remote' },
              { value: String(jobs.length), label: 'Roles' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="text-center"
              >
                <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Perks */}
      <div className="border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h2 className="text-sm font-semibold text-foreground mb-5 text-center">Why join us</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className="flex flex-col items-center text-center gap-2"
              >
                <div className="h-10 w-10 rounded-xl bg-background border border-border/50 flex items-center justify-center">
                  <perk.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">{perk.label}</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-center justify-center gap-1 py-3 overflow-x-auto scrollbar-hide">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
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
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-foreground">
            {activeDepartment === 'All' ? 'All positions' : activeDepartment}
          </h2>
          <span className="text-[11px] text-muted-foreground">
            {filteredJobs.length} role{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="divide-y divide-border/40">
          {filteredJobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.03 }}
            >
              <Link href={`/careers/${job.id}`}>
                <article className="group py-6 first:pt-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                          {job.department}
                        </span>
                        <span className="h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />
                        <span className="text-[11px] text-muted-foreground">{job.type}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {job.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-3 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0 pt-1">
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">
              No open positions in {activeDepartment} right now.
            </p>
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-16 text-center">
          <h2 className="text-base font-semibold text-foreground mb-2">
            Do not see your role?
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            We are always looking for talented people. Send us your resume.
          </p>
          <Link
            href="mailto:careers@picturaai.sbs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            Get in touch
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
