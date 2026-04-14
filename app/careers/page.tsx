'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
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
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center">
            <PicturaIcon size={48} className="mx-auto" />
            <p className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              We&apos;re hiring
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Join <span className="text-primary">Pictura</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
              Help us build the future of AI-powered creativity. We&apos;re a small, remote team based in Nigeria with big ambitions.
            </p>
          </motion.div>

          <div className="my-12 h-px bg-border/50" />

          {/* Stats */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mb-16">
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                { value: '10K+', label: 'Images Generated' },
                { value: '500+', label: 'Creators' },
                { value: '100%', label: 'Remote' },
                { value: String(jobs.length), label: 'Open Roles' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Why Join */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mb-16">
            <h2 className="text-lg font-semibold text-foreground">Why join us</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {[
                { title: 'Remote First', desc: 'Work from anywhere in the world. We believe great work happens when you have the freedom to choose your environment.' },
                { title: 'Ownership', desc: 'Take real ownership of your work. We value autonomy and trust you to make decisions that matter.' },
                { title: 'Growth', desc: 'Learn and grow alongside talented people. We invest in your development and celebrate your wins.' },
                { title: 'Impact', desc: 'Your work will be used by thousands of creators. Build something meaningful from day one.' },
              ].map((perk) => (
                <div key={perk.title}>
                  <h3 className="text-sm font-semibold text-foreground">{perk.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{perk.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="my-12 h-px bg-border/50" />

          {/* Filter */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-8">
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
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-foreground">Open positions</h2>
              <span className="text-xs text-muted-foreground">{filteredJobs.length} role{filteredJobs.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col gap-3">
              {filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.03 }}
                >
                  <Link href={`/careers/${job.id}`}>
                    <article className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:border-primary/20">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{job.department}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span className="text-[10px] text-muted-foreground">{job.type}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">{job.description}</p>
                          <div className="flex items-center gap-1 mt-2.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12 rounded-xl border border-border/50 bg-card">
                <p className="text-sm text-muted-foreground">No open positions in {activeDepartment} right now.</p>
              </div>
            )}
          </motion.section>

          <div className="my-12 h-px bg-border/50" />

          {/* CTA */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="text-center">
            <h2 className="text-lg font-semibold text-foreground">Don&apos;t see your role?</h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              We&apos;re always looking for talented people. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <Link
              href="mailto:careers@picturaai.sbs"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
            >
              Get in touch
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}
