'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  MapPin, 
  Briefcase, 
  Clock, 
  Users, 
  Code2, 
  Palette, 
  PenTool, 
  BarChart3, 
  Megaphone,
  Video,
  Handshake,
  ChevronDown,
  Globe,
  Heart,
  Zap,
  Shield,
  X
} from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type Department = 'all' | 'engineering' | 'design' | 'content' | 'growth'

type Job = {
  id: string
  title: string
  department: Department
  departmentLabel: string
  type: 'Full-time' | 'Part-time' | 'Contract'
  location: 'Remote'
  description: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  icon: React.ElementType
}

const JOBS: Job[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    department: 'engineering',
    departmentLabel: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Join our engineering team to build and scale the infrastructure powering millions of AI-generated images. You will work on cutting-edge AI systems, distributed computing, and web technologies.',
    responsibilities: [
      'Design, develop, and maintain scalable backend services and APIs',
      'Optimize AI model inference pipelines for speed and efficiency',
      'Collaborate with cross-functional teams to ship new features',
      'Write clean, maintainable, and well-tested code',
      'Participate in code reviews and technical discussions',
    ],
    requirements: [
      '3+ years of experience in software development',
      'Proficiency in TypeScript, Python, or Go',
      'Experience with cloud platforms (AWS, GCP, or Vercel)',
      'Strong understanding of distributed systems',
      'Excellent problem-solving skills',
    ],
    niceToHave: [
      'Experience with AI/ML systems',
      'Contributions to open-source projects',
      'Experience with Next.js or React',
    ],
    icon: Code2,
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'engineering',
    departmentLabel: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Help us make data-driven decisions by analyzing user behavior, model performance, and business metrics. You will transform raw data into actionable insights that shape our product strategy.',
    responsibilities: [
      'Analyze large datasets to identify trends and patterns',
      'Build dashboards and reports for stakeholders',
      'Collaborate with product and engineering teams on metrics',
      'Design and run A/B tests to optimize user experience',
      'Present findings and recommendations to leadership',
    ],
    requirements: [
      '2+ years of experience in data analysis',
      'Proficiency in SQL and Python',
      'Experience with data visualization tools',
      'Strong statistical knowledge',
      'Excellent communication skills',
    ],
    niceToHave: [
      'Experience with AI/ML products',
      'Knowledge of product analytics',
      'Experience with BigQuery or Snowflake',
    ],
    icon: BarChart3,
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    department: 'design',
    departmentLabel: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Create stunning visual assets that communicate our brand story and delight our users. You will work on everything from marketing materials to product interfaces, shaping how the world sees Pictura.',
    responsibilities: [
      'Design marketing materials, social graphics, and brand assets',
      'Create UI components and product illustrations',
      'Develop and maintain brand guidelines',
      'Collaborate with marketing on campaign visuals',
      'Iterate on designs based on feedback and data',
    ],
    requirements: [
      '3+ years of experience in graphic design',
      'Proficiency in Figma, Adobe Creative Suite',
      'Strong portfolio showcasing diverse design work',
      'Understanding of typography, color theory, and composition',
      'Ability to work independently and meet deadlines',
    ],
    niceToHave: [
      'Experience with motion graphics',
      'Illustration skills',
      'Experience in tech or AI industry',
    ],
    icon: Palette,
  },
  {
    id: 'video-animator',
    title: 'Video Animator',
    department: 'design',
    departmentLabel: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Bring our brand to life through captivating animations and video content. Create high-quality animations for product demos, social media, and marketing campaigns that showcase the magic of AI-generated visuals.',
    responsibilities: [
      'Create animated videos for product launches and features',
      'Design motion graphics for social media content',
      'Produce tutorial and explainer videos',
      'Develop animated assets for the website and app',
      'Collaborate with marketing on video campaigns',
    ],
    requirements: [
      '3+ years of experience in animation/motion design',
      'Proficiency in After Effects, Premiere Pro, or similar',
      'Strong portfolio of animation work',
      'Understanding of storytelling through motion',
      'Ability to work in fast-paced environment',
    ],
    niceToHave: [
      '3D animation skills (Blender, Cinema 4D)',
      'Experience with cartoon-style animation',
      'Sound design knowledge',
    ],
    icon: Video,
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'growth',
    departmentLabel: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build and grow our social media presence across platforms. You will create engaging content, manage communities, and help spread the word about Pictura to millions of potential users worldwide.',
    responsibilities: [
      'Develop and execute social media strategy',
      'Create engaging content across Twitter, Instagram, TikTok',
      'Manage community engagement and respond to users',
      'Analyze performance metrics and optimize strategy',
      'Identify trends and opportunities for viral content',
    ],
    requirements: [
      '2+ years of social media management experience',
      'Proven track record of growing social accounts',
      'Strong understanding of platform algorithms',
      'Excellent copywriting and communication skills',
      'Data-driven approach to content strategy',
    ],
    niceToHave: [
      'Experience with AI or tech products',
      'Video editing skills',
      'Experience with influencer partnerships',
    ],
    icon: Megaphone,
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'content',
    departmentLabel: 'Content',
    type: 'Full-time',
    location: 'Remote',
    description: 'Craft compelling content that educates, engages, and inspires our community. From blog posts to documentation, you will help users understand and get the most out of our AI tools.',
    responsibilities: [
      'Write blog posts, tutorials, and documentation',
      'Create email newsletters and marketing copy',
      'Develop content strategy aligned with SEO goals',
      'Collaborate with product team on feature announcements',
      'Edit and improve existing content',
    ],
    requirements: [
      '2+ years of content writing experience',
      'Excellent English writing and editing skills',
      'Understanding of SEO best practices',
      'Ability to explain technical concepts clearly',
      'Strong research and fact-checking skills',
    ],
    niceToHave: [
      'Experience writing about AI/technology',
      'Technical writing background',
      'Portfolio of published work',
    ],
    icon: PenTool,
  },
  {
    id: 'partner-growth',
    title: 'Partner Growth Manager',
    department: 'growth',
    departmentLabel: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Drive strategic partnerships that expand our reach and create value for our users. You will identify, negotiate, and manage partnerships with creators, brands, and platforms.',
    responsibilities: [
      'Identify and pursue strategic partnership opportunities',
      'Negotiate partnership terms and agreements',
      'Manage ongoing partner relationships',
      'Develop co-marketing campaigns with partners',
      'Track and report on partnership performance',
    ],
    requirements: [
      '3+ years in business development or partnerships',
      'Strong negotiation and communication skills',
      'Experience with creator or brand partnerships',
      'Self-motivated with entrepreneurial mindset',
      'Track record of closing partnership deals',
    ],
    niceToHave: [
      'Network in AI or creative tools industry',
      'Experience with SaaS partnerships',
      'Knowledge of the creator economy',
    ],
    icon: Handshake,
  },
]

const DEPARTMENTS = [
  { id: 'all' as const, label: 'All Roles', count: JOBS.length },
  { id: 'engineering' as const, label: 'Engineering', count: JOBS.filter(j => j.department === 'engineering').length },
  { id: 'design' as const, label: 'Design', count: JOBS.filter(j => j.department === 'design').length },
  { id: 'content' as const, label: 'Content', count: JOBS.filter(j => j.department === 'content').length },
  { id: 'growth' as const, label: 'Growth', count: JOBS.filter(j => j.department === 'growth').length },
]

const BENEFITS = [
  { icon: Globe, title: 'Work From Anywhere', description: 'Fully remote team across the globe' },
  { icon: Heart, title: 'Health & Wellness', description: 'Comprehensive health coverage' },
  { icon: Zap, title: 'Latest Equipment', description: 'Top-tier hardware for your work' },
  { icon: Shield, title: 'Job Security', description: 'Stable non-profit organization' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

function JobModal({ job, onClose }: { job: Job; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-3xl my-4 sm:my-8 rounded-2xl border border-border/50 bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative border-b border-border/50 bg-gradient-to-br from-primary/5 via-background to-background px-6 py-8 sm:px-8 sm:py-10">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <job.icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{job.title}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Briefcase className="h-3 w-3" />
                  {job.departmentLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {job.type}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-8">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">About the Role</h3>
            <p className="text-sm leading-relaxed text-foreground/90">{job.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Requirements</h3>
            <ul className="space-y-2">
              {job.requirements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-foreground/30" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Nice to Have</h3>
            <ul className="space-y-2">
              {job.niceToHave.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted-foreground/30" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 bg-secondary/20 px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Ready to make an impact? Apply now and join our team.
            </p>
            <a
              href={`mailto:careers@picturaai.sbs?subject=Application: ${job.title}&body=Hi Pictura Team,%0D%0A%0D%0AI am interested in the ${job.title} position.%0D%0A%0D%0A[Please attach your resume and introduce yourself]`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department>('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const filteredJobs = selectedDepartment === 'all' 
    ? JOBS 
    : JOBS.filter(job => job.department === selectedDepartment)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40 pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--primary)/0.12,transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
            >
              <Users className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-foreground">{JOBS.length} Open Positions</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl"
            >
              Join the Team
              <br />
              <span className="text-primary">Building the Future</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Help us make AI creativity accessible to everyone. We are building something special at Pictura, and we want you to be part of it.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-8"
            >
              <a
                href="#positions"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                View Open Positions
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-b border-border/40 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={i}
                variants={fadeUp}
                className="rounded-2xl border border-border/50 bg-card p-5 md:p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <benefit.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section id="positions" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mb-10"
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">Open Positions</h2>
            <p className="mt-2 text-sm text-muted-foreground">Find your next opportunity at Pictura</p>
          </motion.div>

          <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
            {/* Filters - Desktop */}
            <div className="hidden lg:block lg:w-56 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Department</p>
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDepartment(dept.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      selectedDepartment === dept.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {dept.label}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      selectedDepartment === dept.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {dept.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters - Mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">
                  {DEPARTMENTS.find(d => d.id === selectedDepartment)?.label}
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {mobileFilterOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 overflow-hidden rounded-xl border border-border/50 bg-card"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => { setSelectedDepartment(dept.id); setMobileFilterOpen(false) }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-sm transition-colors ${
                          selectedDepartment === dept.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-foreground hover:bg-secondary'
                        }`}
                      >
                        {dept.label}
                        <span className="text-xs text-muted-foreground">{dept.count}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Job Cards */}
            <div className="flex-1 space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredJobs.map((job, i) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="group w-full rounded-2xl border border-border/50 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg md:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                          <job.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                {job.title}
                              </h3>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Briefcase className="h-3 w-3" />
                                  {job.departmentLabel}
                                </span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {job.type}
                                </span>
                                <span className="text-muted-foreground/40">•</span>
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {job.location}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-1" />
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredJobs.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border/50 bg-secondary/20 py-16 text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-4 text-sm text-muted-foreground">No positions in this department right now.</p>
                  <button
                    onClick={() => setSelectedDepartment('all')}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    View all positions
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="mx-auto max-w-2xl"
          >
            <motion.div custom={0} variants={fadeUp}>
              <PicturaIcon size={48} className="mx-auto" />
            </motion.div>
            <motion.h2
              custom={1}
              variants={fadeUp}
              className="mt-6 text-2xl font-bold tracking-tight text-foreground md:text-3xl"
            >
              Do not see the right role?
            </motion.h2>
            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-3 text-sm text-muted-foreground md:text-base"
            >
              We are always looking for talented people. Send us your resume and let us know how you can contribute to our mission.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="mt-8">
              <a
                href="mailto:careers@picturaai.sbs?subject=General Application&body=Hi Pictura Team,%0D%0A%0D%0AI am interested in joining your team.%0D%0A%0D%0A[Please attach your resume and introduce yourself]"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
              >
                Send General Application
                <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Job Modal */}
      <AnimatePresence>
        {selectedJob && (
          <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
