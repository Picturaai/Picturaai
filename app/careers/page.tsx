'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  Briefcase,
  Code2,
  BarChart3,
  Palette,
  Film,
  Megaphone,
  PenTool,
  TrendingUp,
  X,
  Upload,
  CheckCircle2,
  Loader2,
  FileText,
  Globe,
  Users,
  Sparkles,
  Heart,
  Zap,
  Shield,
  Coffee
} from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type Job = {
  id: string
  title: string
  department: string
  departmentLabel: string
  type: string
  location: string
  description: string
  about: string
  responsibilities: string[]
  requirements: string[]
  niceToHave: string[]
  icon: typeof Code2
}

const JOBS: Job[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    department: 'engineering',
    departmentLabel: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build the next generation of AI-powered creative tools. Work on challenging problems at the intersection of machine learning, distributed systems, and user experience.',
    about: 'We are looking for a Software Engineer to join our core platform team. You will work on building scalable infrastructure that powers millions of AI generations, develop new features for our creative suite, and help shape the technical direction of Pictura. This role offers the opportunity to work with cutting-edge AI technologies while building products that empower creators worldwide.',
    responsibilities: [
      'Design, build, and maintain scalable backend services and APIs',
      'Collaborate with ML engineers to deploy and optimize AI models in production',
      'Improve system reliability, performance, and developer experience',
      'Participate in architectural decisions and code reviews',
      'Mentor junior engineers and contribute to team growth'
    ],
    requirements: [
      '3+ years of professional software engineering experience',
      'Strong proficiency in TypeScript/JavaScript and Node.js',
      'Experience with cloud platforms (AWS, GCP, or Vercel)',
      'Familiarity with databases (PostgreSQL, Redis) and system design',
      'Excellent problem-solving and communication skills'
    ],
    niceToHave: [
      'Experience with AI/ML systems or computer vision',
      'Contributions to open-source projects',
      'Experience with real-time systems or streaming architectures',
      'Background in creative tools or media processing'
    ],
    icon: Code2
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    department: 'engineering',
    departmentLabel: 'Engineering',
    type: 'Full-time',
    location: 'Remote',
    description: 'Transform raw data into actionable insights that drive product decisions and business strategy. Help us understand our users and improve their creative experience.',
    about: 'As a Data Analyst at Pictura, you will be at the heart of our data-driven decision making. You will analyze user behavior, measure product performance, and uncover opportunities for growth. Your insights will directly influence product roadmaps, marketing strategies, and business operations.',
    responsibilities: [
      'Analyze product usage data to identify trends and opportunities',
      'Build dashboards and reports for stakeholders across the company',
      'Design and analyze A/B tests to measure feature impact',
      'Collaborate with product and engineering teams on metrics definition',
      'Present findings and recommendations to leadership'
    ],
    requirements: [
      '2+ years of experience in data analysis or related field',
      'Strong SQL skills and experience with data visualization tools',
      'Proficiency in Python or R for statistical analysis',
      'Experience with analytics platforms (Mixpanel, Amplitude, or similar)',
      'Excellent communication and storytelling with data'
    ],
    niceToHave: [
      'Experience with machine learning or predictive modeling',
      'Background in product analytics at a B2C tech company',
      'Knowledge of experimentation frameworks and statistical methods',
      'Familiarity with data warehouses (BigQuery, Snowflake)'
    ],
    icon: BarChart3
  },
  {
    id: 'graphic-designer',
    title: 'Graphic Designer',
    department: 'design',
    departmentLabel: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Shape the visual identity of Pictura across all touchpoints. Create stunning designs that communicate our brand and inspire millions of creators.',
    about: 'We are seeking a talented Graphic Designer to elevate Pictura&apos;s visual presence. You will create compelling designs for marketing campaigns, product interfaces, and brand communications. This role combines strategic thinking with hands-on design execution, working closely with marketing, product, and leadership teams.',
    responsibilities: [
      'Create visual designs for marketing campaigns, social media, and web',
      'Develop and maintain brand guidelines and design systems',
      'Design product marketing materials, presentations, and collateral',
      'Collaborate with product designers on feature launches',
      'Experiment with AI-assisted design workflows'
    ],
    requirements: [
      '3+ years of professional graphic design experience',
      'Strong portfolio demonstrating range and creativity',
      'Expert proficiency in Figma, Adobe Creative Suite',
      'Understanding of typography, color theory, and layout principles',
      'Ability to work independently and meet deadlines'
    ],
    niceToHave: [
      'Experience with motion graphics or animation',
      'Interest in AI-generated art and emerging creative tools',
      'Background in tech or SaaS brand design',
      'Illustration or 3D design skills'
    ],
    icon: Palette
  },
  {
    id: 'video-animator',
    title: 'Video Animator',
    department: 'design',
    departmentLabel: 'Design',
    type: 'Full-time',
    location: 'Remote',
    description: 'Create captivating animated content that showcases Pictura&apos;s capabilities. From product demos to social content, bring our brand to life through motion.',
    about: 'We are looking for a Video Animator to create stunning animated content that demonstrates the magic of AI-generated visuals. You will produce everything from short-form social content to detailed product walkthroughs. This is a unique opportunity to work at the intersection of traditional animation and AI-powered creativity.',
    responsibilities: [
      'Create animated videos for product launches and marketing campaigns',
      'Develop motion graphics for social media and advertising',
      'Produce tutorial and explainer videos for users',
      'Establish animation guidelines and reusable templates',
      'Collaborate with the creative team on storytelling and concepts'
    ],
    requirements: [
      '3+ years of experience in motion design or video animation',
      'Expert proficiency in After Effects, Premiere Pro, or similar',
      'Strong understanding of animation principles and timing',
      'Experience with character animation or cartoon-style content',
      'Portfolio demonstrating range of animation styles'
    ],
    niceToHave: [
      'Experience with 3D animation (Cinema 4D, Blender)',
      'Knowledge of AI video generation tools',
      'Sound design and audio editing skills',
      'Background in YouTube content or viral social media'
    ],
    icon: Film
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'growth',
    departmentLabel: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build and engage our global community of creators. Develop content strategies that grow our presence and establish Pictura as a leader in AI creativity.',
    about: 'As Social Media Manager, you will own Pictura&apos;s presence across all social platforms. You will develop content strategies, engage with our community, and drive brand awareness. This role combines creative content creation with analytical thinking to grow our audience and build lasting relationships with creators.',
    responsibilities: [
      'Develop and execute social media strategy across all platforms',
      'Create engaging content that showcases user creations and product features',
      'Build and nurture our creator community through active engagement',
      'Analyze performance metrics and optimize content strategy',
      'Stay ahead of social trends and platform changes'
    ],
    requirements: [
      '2+ years of social media management experience',
      'Proven track record of growing engaged communities',
      'Excellent copywriting and content creation skills',
      'Experience with social media analytics and scheduling tools',
      'Deep understanding of Twitter/X, Instagram, TikTok, and YouTube'
    ],
    niceToHave: [
      'Experience in tech, creative tools, or AI industry',
      'Background in community management or creator relations',
      'Video editing and content creation skills',
      'Personal brand or creator experience'
    ],
    icon: Megaphone
  },
  {
    id: 'content-writer',
    title: 'Content Writer',
    department: 'content',
    departmentLabel: 'Content',
    type: 'Full-time',
    location: 'Remote',
    description: 'Craft compelling narratives that educate and inspire our users. From blog posts to documentation, shape how the world understands AI-powered creativity.',
    about: 'We are seeking a Content Writer to tell Pictura&apos;s story and educate our growing user base. You will create content that spans the funnel—from awareness-building blog posts to detailed documentation and tutorials. This role requires someone who can translate complex technical concepts into engaging, accessible content.',
    responsibilities: [
      'Write blog posts, case studies, and thought leadership content',
      'Create product documentation, guides, and tutorials',
      'Develop email campaigns and lifecycle communications',
      'Collaborate with SEO team to optimize content for search',
      'Maintain consistent brand voice across all content'
    ],
    requirements: [
      '3+ years of professional writing experience',
      'Strong portfolio of published content',
      'Excellent research and interviewing skills',
      'Understanding of SEO principles and content marketing',
      'Ability to explain technical concepts clearly'
    ],
    niceToHave: [
      'Experience writing about AI, technology, or creative tools',
      'Background in technical writing or documentation',
      'Journalism or editorial experience',
      'Familiarity with AI image generation concepts'
    ],
    icon: PenTool
  },
  {
    id: 'partner-growth-manager',
    title: 'Partner Growth Manager',
    department: 'growth',
    departmentLabel: 'Growth',
    type: 'Full-time',
    location: 'Remote',
    description: 'Build strategic partnerships that expand Pictura&apos;s reach and capabilities. Connect with platforms, creators, and enterprises to drive mutual growth.',
    about: 'As Partner Growth Manager, you will identify, negotiate, and manage strategic partnerships that accelerate Pictura&apos;s growth. You will work with platforms, API customers, creator networks, and enterprise clients to build relationships that drive revenue and expand our ecosystem.',
    responsibilities: [
      'Identify and pursue strategic partnership opportunities',
      'Negotiate partnership agreements and manage ongoing relationships',
      'Develop go-to-market strategies for partner initiatives',
      'Build relationships with platforms, agencies, and enterprise clients',
      'Track partnership performance and report on growth metrics'
    ],
    requirements: [
      '4+ years in business development, partnerships, or sales',
      'Track record of closing and managing strategic partnerships',
      'Strong negotiation and relationship-building skills',
      'Experience with SaaS, API, or platform business models',
      'Excellent presentation and communication abilities'
    ],
    niceToHave: [
      'Network in the creative tools or AI industry',
      'Experience with enterprise sales or developer relations',
      'Background in creator economy or digital media',
      'Technical understanding of APIs and integrations'
    ],
    icon: TrendingUp
  }
]

const DEPARTMENTS = [
  { id: 'all', label: 'All Departments', count: JOBS.length },
  { id: 'engineering', label: 'Engineering', count: JOBS.filter(j => j.department === 'engineering').length },
  { id: 'design', label: 'Design', count: JOBS.filter(j => j.department === 'design').length },
  { id: 'growth', label: 'Growth', count: JOBS.filter(j => j.department === 'growth').length },
  { id: 'content', label: 'Content', count: JOBS.filter(j => j.department === 'content').length },
]

const PERKS = [
  { icon: Globe, title: 'Remote First', description: 'Work from anywhere in the world' },
  { icon: Sparkles, title: 'Equity Package', description: 'Own a piece of what you build' },
  { icon: Heart, title: 'Health Coverage', description: 'Comprehensive health benefits' },
  { icon: Zap, title: 'Latest Tools', description: 'Best-in-class equipment and software' },
  { icon: Shield, title: 'Flexible PTO', description: 'Take the time you need' },
  { icon: Coffee, title: 'Learning Budget', description: 'Invest in your growth' },
]

function ApplicationModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: '',
    experience: '',
    coverLetter: '',
    heardFrom: '',
    startDate: ''
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.experience) newErrors.experience = 'Experience level is required'
    if (!resumeFile) newErrors.resume = 'Resume is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setStep('submitting')

    try {
      const submitData = new FormData()
      submitData.append('jobId', job.id)
      submitData.append('jobTitle', job.title)
      submitData.append('department', job.departmentLabel)
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      if (resumeFile) submitData.append('resume', resumeFile)
      if (portfolioFile) submitData.append('portfolio', portfolioFile)

      const response = await fetch('/api/careers/apply', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) throw new Error('Submission failed')

      setStep('success')
    } catch {
      setErrors({ submit: 'Failed to submit application. Please try again.' })
      setStep('form')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'portfolio') => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [type]: 'File must be less than 10MB' }))
        return
      }
      if (type === 'resume') {
        setResumeFile(file)
        setErrors(prev => ({ ...prev, resume: '' }))
      } else {
        setPortfolioFile(file)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative my-8 w-full max-w-2xl rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm px-6 py-4 rounded-t-2xl">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Apply for position</p>
            <h2 className="mt-1 text-xl font-semibold text-foreground">{job.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">Application Submitted</h3>
                <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for your interest in joining Pictura. We have received your application and will review it carefully. Expect to hear from us within 5-7 business days.
                </p>
                <button
                  onClick={onClose}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Close
                </button>
              </motion.div>
            ) : step === 'submitting' ? (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-16 text-center"
              >
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">Submitting your application...</p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {errors.submit && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                    {errors.submit}
                  </div>
                )}

                {/* Personal Information */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Personal Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        First Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.firstName ? 'border-destructive' : 'border-border'}`}
                        placeholder="John"
                      />
                      {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Last Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.lastName ? 'border-destructive' : 'border-border'}`}
                        placeholder="Doe"
                      />
                      {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-destructive' : 'border-border'}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Phone Number <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.phone ? 'border-destructive' : 'border-border'}`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Location <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.location ? 'border-destructive' : 'border-border'}`}
                      placeholder="City, Country"
                    />
                    {errors.location && <p className="mt-1 text-xs text-destructive">{errors.location}</p>}
                  </div>
                </div>

                {/* Professional Links */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Professional Links</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={formData.linkedin}
                        onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Portfolio / Website</label>
                      <input
                        type="url"
                        value={formData.portfolio}
                        onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Experience</h3>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Years of Experience <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.experience ? 'border-destructive' : 'border-border'}`}
                    >
                      <option value="">Select experience level</option>
                      <option value="0-1">0-1 years</option>
                      <option value="1-3">1-3 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="5-8">5-8 years</option>
                      <option value="8+">8+ years</option>
                    </select>
                    {errors.experience && <p className="mt-1 text-xs text-destructive">{errors.experience}</p>}
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">Earliest Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Documents</h3>
                  <div className="space-y-4">
                    {/* Resume Upload */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Resume / CV <span className="text-destructive">*</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'resume')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`group w-full rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                          resumeFile 
                            ? 'border-primary/30 bg-primary/5' 
                            : errors.resume 
                              ? 'border-destructive/50 bg-destructive/5' 
                              : 'border-border hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        {resumeFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">{resumeFile.name}</span>
                            <span className="text-xs text-muted-foreground">({(resumeFile.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-8 w-8 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                            <p className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Click to upload</span> or drag and drop
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/70">PDF, DOC, DOCX up to 10MB</p>
                          </>
                        )}
                      </button>
                      {errors.resume && <p className="mt-1 text-xs text-destructive">{errors.resume}</p>}
                    </div>

                    {/* Portfolio Upload */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Portfolio / Work Samples <span className="text-muted-foreground/60">(Optional)</span>
                      </label>
                      <input
                        ref={portfolioInputRef}
                        type="file"
                        accept=".pdf,.zip,.doc,.docx"
                        onChange={(e) => handleFileChange(e, 'portfolio')}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => portfolioInputRef.current?.click()}
                        className={`group w-full rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
                          portfolioFile 
                            ? 'border-primary/30 bg-primary/5' 
                            : 'border-border hover:border-primary/30 hover:bg-primary/5'
                        }`}
                      >
                        {portfolioFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-foreground">{portfolioFile.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Upload className="h-4 w-4" />
                            <span>Upload portfolio or work samples</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Additional Information</h3>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      Cover Letter / Why Pictura?
                    </label>
                    <textarea
                      value={formData.coverLetter}
                      onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Tell us why you're excited about this role and what you'd bring to Pictura..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">How did you hear about us?</label>
                    <select
                      value={formData.heardFrom}
                      onChange={(e) => setFormData({ ...formData, heardFrom: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">Select an option</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="referral">Employee Referral</option>
                      <option value="job-board">Job Board</option>
                      <option value="search">Search Engine</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4 border-t border-border/50">
                  <button
                    type="submit"
                    className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Submit Application
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    By submitting, you agree to our privacy policy and consent to being contacted about this role.
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

function JobDetailModal({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative my-8 w-full max-w-3xl rounded-2xl bg-background shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border/50 bg-background/95 backdrop-blur-sm rounded-t-2xl">
          <div className="px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <job.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{job.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                      <Briefcase className="h-3 w-3" />
                      {job.departmentLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {job.type}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 sm:px-8 sm:py-8">
          {/* About */}
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">About the Role</h3>
            <p className="mt-3 text-sm leading-relaxed text-foreground">{job.about}</p>
          </section>

          {/* Responsibilities */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What You&apos;ll Do</h3>
            <ul className="mt-3 space-y-2">
              {job.responsibilities.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Requirements */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">What We&apos;re Looking For</h3>
            <ul className="mt-3 space-y-2">
              {job.requirements.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Nice to Have */}
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Nice to Have</h3>
            <ul className="mt-3 space-y-2">
              {job.niceToHave.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border/50 bg-background/95 backdrop-blur-sm px-6 py-4 sm:px-8 rounded-b-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Pictura is an equal opportunity employer.
            </p>
            <button
              onClick={onApply}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Apply Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function CareersPage() {
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applyingJob, setApplyingJob] = useState<Job | null>(null)

  const filteredJobs = selectedDepartment === 'all' 
    ? JOBS 
    : JOBS.filter(job => job.department === selectedDepartment)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-32 sm:pb-24 sm:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              We&apos;re hiring
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build the future of
              <span className="block text-primary">AI creativity</span>
            </h1>
            <p className="mt-6 text-base text-muted-foreground sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Join a team of passionate builders shaping how millions of people create. 
              We&apos;re looking for curious minds who want to push the boundaries of what&apos;s possible.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href="#positions"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Open Positions
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#perks"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Why Pictura
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/40 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '10M+', label: 'Images generated' },
              { value: '500K+', label: 'Active creators' },
              { value: '100%', label: 'Remote team' },
              { value: '7', label: 'Open positions' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section id="perks" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Why join Pictura</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">Benefits and perks that support your best work</p>
          </motion.div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((perk, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 rounded-xl border border-border/50 bg-card p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <perk.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{perk.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{perk.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="border-t border-border/40 bg-secondary/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Open Positions</h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">Find your next opportunity at Pictura</p>
          </motion.div>

          {/* Department Filter */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  selectedDepartment === dept.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-border/80'
                }`}
              >
                {dept.label}
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  selectedDepartment === dept.id
                    ? 'bg-primary-foreground/20 text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}>
                  {dept.count}
                </span>
              </button>
            ))}
          </div>

          {/* Job Cards */}
          <div className="mt-10 space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredJobs.map((job, i) => (
                <motion.button
                  key={job.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => setSelectedJob(job)}
                  className="group flex w-full items-center gap-4 rounded-xl border border-border/50 bg-card p-5 text-left transition-all hover:border-primary/30 hover:shadow-lg sm:p-6"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                    <job.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors sm:text-lg">
                      {job.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-xs text-muted-foreground">{job.departmentLabel}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="text-xs text-muted-foreground">{job.type}</span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="text-xs text-muted-foreground">{job.location}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground/40 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </motion.button>
              ))}
            </AnimatePresence>

            {filteredJobs.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/50 bg-background py-16 text-center">
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
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <PicturaIcon size={48} className="mx-auto" />
            <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Do not see the right role?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              We are always looking for talented people. Send us your resume and let us know how you can contribute to our mission.
            </p>
            <a
              href="mailto:careers@picturaai.sbs?subject=General Application"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-background px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary"
            >
              Send General Application
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <AnimatePresence>
        {selectedJob && !applyingJob && (
          <JobDetailModal 
            job={selectedJob} 
            onClose={() => setSelectedJob(null)} 
            onApply={() => { setApplyingJob(selectedJob); setSelectedJob(null) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {applyingJob && (
          <ApplicationModal 
            job={applyingJob} 
            onClose={() => setApplyingJob(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
