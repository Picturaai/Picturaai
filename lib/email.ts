import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.zeptomail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.ZEPTO_MAIL_USERNAME || 'emailapikey',
    pass: process.env.ZEPTO_MAIL_PASSWORD || '',
  },
})

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    const result = await transporter.sendMail({
      from: options.from || `Pictura API <noreply@picturaai.sbs>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('[v0] Email send error:', error)
    return { success: false, error: String(error) }
  }
}

export function generateOTP(): string {
  return Math.random().toString().slice(2, 8)
}

export function getOTPEmailTemplate(otp: string, name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #8B5A3C 0%, #A0704D 100%); padding: 40px 20px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; color: #fff; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 40px 20px; text-align: center; }
          .otp-box { background: #fff; border: 2px solid #8B5A3C; border-radius: 8px; padding: 30px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #8B5A3C; letter-spacing: 5px; font-family: 'Courier New', monospace; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .divider { height: 1px; background: #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎨 Pictura API</div>
            <p style="color: #fff; margin: 0;">Your One-Stop AI Image Generation API</p>
          </div>
          
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Your verification code is ready. Use it to complete your signup.</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your One-Time Password:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 10px 0 0 0; color: #999; font-size: 12px;">Valid for 10 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">This code is for your security. Never share it with anyone.</p>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>© 2026 Pictura. All rights reserved.</p>
            <p><a href="https://picturaai.sbs" style="color: #8B5A3C; text-decoration: none;">picturaai.sbs</a></p>
          </div>
        </div>
      </body>
    </html>
  `
}

export function getWelcomeEmailTemplate(
  name: string,
  credits: number,
  currency: string
): string {
  const creditAmount =
    currency === 'NGN' ? (credits * 800).toFixed(0) : credits.toFixed(2)

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #8B5A3C 0%, #A0704D 100%); padding: 40px 20px; text-align: center; color: #fff; }
          .logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .content { background: #f9f9f9; padding: 40px 20px; }
          .card { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5A3C; }
          .credits-badge { background: linear-gradient(135deg, #8B5A3C 0%, #A0704D 100%); color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .credit-amount { font-size: 28px; font-weight: bold; }
          .credit-label { font-size: 14px; opacity: 0.9; }
          .button { display: inline-block; background: #8B5A3C; color: #fff; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 10px 5px; }
          .footer { background: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .divider { height: 1px; background: #ddd; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎨 Pictura API</div>
            <p style="margin: 0;">Welcome to the Future of Image Generation</p>
          </div>
          
          <div class="content">
            <h2>Welcome to Pictura, ${name}!</h2>
            <p>Your developer account is now active. Get started with our powerful AI image generation API.</p>
            
            <div class="credits-badge">
              <div class="credit-amount">${creditAmount}</div>
              <div class="credit-label">${currency} in Free Credits</div>
            </div>
            
            <div class="card">
              <h3 style="margin-top: 0;">🚀 Get Started</h3>
              <p>1. Generate your API key in the dashboard</p>
              <p>2. Install the Pictura SDK</p>
              <p>3. Make your first API call</p>
            </div>
            
            <div class="card">
              <h3 style="margin-top: 0;">📚 Documentation</h3>
              <p>Check out our comprehensive docs to integrate Pictura into your project.</p>
              <a href="https://picturaai.sbs/docs" class="button">View Docs</a>
            </div>
            
            <div class="card">
              <h3 style="margin-top: 0;">💬 Need Help?</h3>
              <p>Our support team is here to help. Email us at support@picturaai.sbs</p>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <p>© 2026 Pictura. All rights reserved.</p>
            <p><a href="https://picturaai.sbs" style="color: #8B5A3C; text-decoration: none;">picturaai.sbs</a></p>
          </div>
        </div>
      </body>
    </html>
  `
}
