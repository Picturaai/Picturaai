import nodemailer from 'nodemailer'
import { emailTemplates } from './email-templates'
import crypto from 'crypto'

// ZeptoMail transporter (primary)
const zeptoTransporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZEPTO_MAIL_USERNAME || 'emailapikey',
    pass: process.env.ZEPTO_MAIL_PASSWORD || '',
  },
})

// Resend transporter (fallback)
interface ResendConfig {
  apiKey: string
  fromEmail: string
}

function getResendConfig(): ResendConfig | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return {
    apiKey,
    fromEmail: process.env.RESEND_FROM_EMAIL || 'developer@picturaai.sbs',
  }
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

async function sendWithZepto(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const result = await zeptoTransporter.sendMail({
      from: options.from || `Pictura Developer <developer@picturaai.sbs>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[Email] ZeptoMail error:', error)
    return { success: false, error: String(error) }
  }
}

async function sendWithResend(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const config = getResendConfig()
  if (!config) {
    return { success: false, error: 'Resend not configured' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || config.fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[Email] Resend API error:', response.status, errorData)
      return { success: false, error: `Resend error: ${response.status}` }
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('[Email] Resend error:', error)
    return { success: false, error: String(error) }
  }
}

export async function sendEmail(options: SendEmailOptions) {
  // Try ZeptoMail first
  const zeptoResult = await sendWithZepto(options)
  if (zeptoResult.success) {
    return zeptoResult
  }

  console.log('[Email] ZeptoMail failed, trying Resend fallback...')

  // Try Resend as fallback
  const resendResult = await sendWithResend(options)
  if (resendResult.success) {
    console.log('[Email] Resend fallback succeeded')
    return resendResult
  }

  // Both failed
  console.error('[Email] Both ZeptoMail and Resend failed')
  return { 
    success: false, 
    error: `ZeptoMail: ${zeptoResult.error}; Resend: ${resendResult.error}` 
  }
}

export function generateOTP(): string {
  // Use a cryptographically secure RNG so OTP codes are not predictable.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

export async function sendOTPEmail(email: string, name: string, otp: string) {
  const html = emailTemplates.otp(name, otp)
  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Pictura AI',
    html,
  })
}

export async function sendWelcomeEmail(email: string, name: string, credits: number, currency: string) {
  const html = emailTemplates.welcomeCredits(name, credits, currency)
  return sendEmail({
    to: email,
    subject: 'Welcome to Pictura AI - Developer Platform',
    html,
  })
}

export async function sendLowCreditsAlert(email: string, name: string, creditsRemaining: number, currency: string) {
  const html = emailTemplates.lowCreditsAlert(name, creditsRemaining, currency)
  return sendEmail({
    to: email,
    subject: 'Low Credits Alert - Pictura AI',
    html,
  })
}

export async function sendInvoiceEmail(email: string, name: string, invoiceId: string, amount: number, currency: string, items: any[], date: string) {
  const html = emailTemplates.invoice(name, invoiceId, amount, currency, items, date)
  return sendEmail({
    to: email,
    subject: `Invoice ${invoiceId} - Pictura AI`,
    html,
  })
}

export async function sendCaptchaWelcomeEmail(email: string, name: string) {
  const html = emailTemplates.captchaWelcome(name)
  return sendEmail({
    to: email,
    subject: 'Welcome to PicturaCAPTCHA - Your Account is Ready',
    html,
  })
}
