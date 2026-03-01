'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, Clock, Search, BookOpen, Sparkles, Lightbulb, Rocket } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  cover_image: string
  category: string
  read_time: number
  published: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

const CATEGORIES = [
  { id: 'all', label: 'All Posts', icon: BookOpen },
  { id: 'announcement', label: 'Announcements', icon: Sparkles },
  { id: 'tutorial', label: 'Tutorials', icon: Lightbulb },
  { id: 'guide', label: 'Guides', icon: Rocket },
]

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/blog')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts || [])
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category.toLowerCase() === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredPost = filteredPosts.find(p => p.featured)
  const regularPosts = filteredPosts.filter(p => !p.featured)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="h-4 w-4" />
              Pictura Blog
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
              Insights & Updates
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Product announcements, tutorials, and tips for creating stunning AI-generated images.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="border-b border-border/40 bg-card/50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-1 overflow-x-auto py-4 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term.' : 'Check back soon for new content!'}
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Featured Post */}
            {featuredPost && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Featured</h2>
                </div>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <article className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card hover:border-primary/30 transition-all duration-300">
                    <div className="grid lg:grid-cols-5 gap-0">
                      <div className="relative lg:col-span-3 aspect-[16/10] lg:aspect-auto lg:min-h-[400px] overflow-hidden">
                        <Image
                          src={featuredPost.cover_image}
                          alt={featuredPost.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 1024px) 100vw, 60vw"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 lg:hidden" />
                        <div className="absolute bottom-4 left-4 lg:hidden">
                          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                            {featuredPost.category}
                          </span>
                        </div>
                      </div>
                      <div className="lg:col-span-2 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                        <span className="hidden lg:inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider w-fit mb-4">
                          {featuredPost.category}
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                          {featuredPost.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {new Date(featuredPost.created_at).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {featuredPost.read_time} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                          Read Article
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              </motion.section>
            )}

            {/* All Posts Grid */}
            {regularPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeCategory === 'all' ? 'All Articles' : `${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {regularPosts.length} article{regularPosts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularPosts.map((post, i) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="group h-full flex flex-col overflow-hidden rounded-xl border border-border/40 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <Image
                              src={post.cover_image}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-1 p-5 flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                                {post.category}
                              </span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                              {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/40">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(post.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {post.read_time} min read
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Newsletter CTA */}
      <section className="border-t border-border/40 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Get the latest news about Pictura features, tips, and AI image generation trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-xl bg-background border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
              />
              <button className="h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
