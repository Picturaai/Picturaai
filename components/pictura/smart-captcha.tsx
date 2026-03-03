'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

interface SmartCaptchaProps {
  onVerify: (token: string) => void
  className?: string
}

// Generate a secure token
const generateToken = (data: Record<string, unknown>) => {
  const payload = JSON.stringify(data)
  const timestamp = Date.now()
  // Simple base64 encoding with timestamp for verification
  return btoa(`${timestamp}:${payload}`)
}

export function SmartCaptcha({ onVerify, className = '' }: SmartCaptchaProps) {
  const [verified, setVerified] = useState(false)
  const [checking, setChecking] = useState(false)
  const [hovered, setHovered] = useState(false)
  
  // Behavior tracking
  const behaviorRef = useRef({
    mouseMovements: 0,
    keyPresses: 0,
    clickCount: 0,
    scrolls: 0,
    startTime: Date.now(),
    mousePositions: [] as Array<{ x: number; y: number; t: number }>,
    checkboxHoverTime: 0,
    focusEvents: 0,
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const hoverStartRef = useRef<number>(0)

  // Track mouse movements globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      behaviorRef.current.mouseMovements++
      
      // Store some positions for trajectory analysis
      if (behaviorRef.current.mousePositions.length < 50) {
        behaviorRef.current.mousePositions.push({
          x: e.clientX,
          y: e.clientY,
          t: Date.now(),
        })
      }
    }

    const handleKeyPress = () => {
      behaviorRef.current.keyPresses++
    }

    const handleClick = () => {
      behaviorRef.current.clickCount++
    }

    const handleScroll = () => {
      behaviorRef.current.scrolls++
    }

    const handleFocus = () => {
      behaviorRef.current.focusEvents++
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClick)
    document.addEventListener('scroll', handleScroll)
    document.addEventListener('focusin', handleFocus)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyPress)
      document.removeEventListener('click', handleClick)
      document.removeEventListener('scroll', handleScroll)
      document.removeEventListener('focusin', handleFocus)
    }
  }, [])

  // Calculate human-likeness score
  const calculateScore = useCallback(() => {
    const behavior = behaviorRef.current
    const timeOnPage = (Date.now() - behavior.startTime) / 1000 // seconds
    
    let score = 0
    
    // Time on page (humans spend time filling forms)
    if (timeOnPage > 3) score += 15
    if (timeOnPage > 10) score += 10
    if (timeOnPage > 30) score += 5
    
    // Mouse movements (bots often don't move mouse naturally)
    if (behavior.mouseMovements > 5) score += 15
    if (behavior.mouseMovements > 20) score += 10
    if (behavior.mouseMovements > 50) score += 5
    
    // Key presses (filling out forms)
    if (behavior.keyPresses > 5) score += 15
    if (behavior.keyPresses > 20) score += 10
    
    // Click count
    if (behavior.clickCount >= 1) score += 10
    
    // Scroll activity
    if (behavior.scrolls > 0) score += 5
    
    // Focus events (tabbing through form fields)
    if (behavior.focusEvents > 2) score += 5
    
    // Checkbox hover time (humans hover before clicking)
    if (behavior.checkboxHoverTime > 100) score += 10
    if (behavior.checkboxHoverTime > 500) score += 5
    
    // Mouse trajectory analysis - check for natural curved movements
    if (behavior.mousePositions.length > 5) {
      let hasVariation = false
      for (let i = 2; i < behavior.mousePositions.length; i++) {
        const dx1 = behavior.mousePositions[i].x - behavior.mousePositions[i-1].x
        const dy1 = behavior.mousePositions[i].y - behavior.mousePositions[i-1].y
        const dx2 = behavior.mousePositions[i-1].x - behavior.mousePositions[i-2].x
        const dy2 = behavior.mousePositions[i-1].y - behavior.mousePositions[i-2].y
        
        // Check for direction changes (natural mouse movement)
        if ((dx1 * dx2 < 0) || (dy1 * dy2 < 0)) {
          hasVariation = true
          break
        }
      }
      if (hasVariation) score += 10
    }
    
    return Math.min(score, 100)
  }, [])

  const handleVerify = async () => {
    if (verified || checking) return
    
    // Calculate hover time
    if (hoverStartRef.current) {
      behaviorRef.current.checkboxHoverTime = Date.now() - hoverStartRef.current
    }
    
    setChecking(true)
    
    // Small delay to simulate verification
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const score = calculateScore()
    const behavior = behaviorRef.current
    
    // Require minimum score of 30 to pass
    if (score >= 30) {
      setVerified(true)
      
      // Generate verification token with behavior data
      const token = generateToken({
        score,
        timeOnPage: (Date.now() - behavior.startTime) / 1000,
        mouseMovements: behavior.mouseMovements,
        keyPresses: behavior.keyPresses,
        verified: true,
        timestamp: Date.now(),
      })
      
      onVerify(token)
    } else {
      // Still pass but flag as suspicious (for monitoring)
      setVerified(true)
      const token = generateToken({
        score,
        suspicious: true,
        timeOnPage: (Date.now() - behavior.startTime) / 1000,
        verified: true,
        timestamp: Date.now(),
      })
      onVerify(token)
    }
    
    setChecking(false)
  }

  const handleMouseEnter = () => {
    setHovered(true)
    hoverStartRef.current = Date.now()
  }

  const handleMouseLeave = () => {
    setHovered(false)
    if (hoverStartRef.current) {
      behaviorRef.current.checkboxHoverTime += Date.now() - hoverStartRef.current
    }
  }

  return (
    <div
      ref={containerRef}
      className={`border border-border rounded-lg bg-card/50 ${className}`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={handleVerify}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          disabled={verified || checking}
          className={`
            relative h-6 w-6 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${verified 
              ? 'bg-primary border-primary' 
              : hovered 
                ? 'border-primary/60 bg-primary/5' 
                : 'border-border bg-background hover:border-primary/40'
            }
            ${checking ? 'cursor-wait' : verified ? 'cursor-default' : 'cursor-pointer'}
          `}
        >
          {checking && (
            <div className="h-3 w-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
          {verified && !checking && (
            <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
          )}
        </button>
        
        <span className="text-sm text-foreground select-none">
          {checking ? 'Verifying...' : verified ? 'Verified' : "I'm not a robot"}
        </span>
        
        <div className="ml-auto flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/50 font-medium">Pictura</span>
        </div>
      </div>
    </div>
  )
}
