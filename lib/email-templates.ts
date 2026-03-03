// Pictura AI Email Templates - Clean, Vercel-inspired design
// Brand color: #C27D4F (terracotta/rust - matches oklch(0.62 0.14 45))

export const emailTemplates = {
  otp: (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C27D4F; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Verify your email address</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 32px 0; font-size: 14px; color: #666; line-height: 1.6;">Enter this verification code to complete your signup:</p>
                                        
                                        <!-- OTP Code -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #000; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace;">${otp}</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 13px; color: #999; line-height: 1.5;">This code expires in 10 minutes.</p>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  welcomeCredits: (name: string, credits: number, currency: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Pictura</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C27D4F; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Welcome to Pictura</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Your developer account is ready. We've added <strong style="color: #000;">${credits} ${currency}</strong> in free credits to help you get started.</p>
                                        
                                        <!-- Credits Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #C27D4F; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px;">Your Balance</p>
                                                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #fff;">${credits} ${currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Here's what you can do next:</p>
                                        
                                        <!-- Steps -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; margin-bottom: 8px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C27D4F; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">1</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Create your first API key in the dashboard</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C27D4F; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">2</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Read the API documentation</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C27D4F; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">3</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Start generating images with your app</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/developers/dashboard" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">Go to Dashboard</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  lowCreditsAlert: (name: string, creditsRemaining: number, currency: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Credits Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C27D4F; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Your credits are running low</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 32px 0; font-size: 14px; color: #666; line-height: 1.6;">Your Pictura account balance is getting low. Add more credits to continue generating images without interruption.</p>
                                        
                                        <!-- Balance Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Remaining Balance</p>
                                                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #dc2626;">${creditsRemaining} ${currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/developers/dashboard/billing" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">Add Credits</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  invoice: (name: string, invoiceId: string, amount: number, currency: string, items: Array<{description: string, amount: number}>, date: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="width: 32px; height: 32px; background-color: #C27D4F; border-radius: 6px; text-align: center; vertical-align: middle;">
                                                    <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                                </td>
                                                <td style="padding-left: 10px;">
                                                    <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="font-size: 14px; font-weight: 600; color: #000;">INVOICE</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Invoice Details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td width="50%">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Billed to</p>
                                                    <p style="margin: 0; font-size: 14px; font-weight: 500; color: #000;">${name}</p>
                                                </td>
                                                <td style="text-align: right;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999;">Invoice #${invoiceId}</p>
                                                    <p style="margin: 0; font-size: 12px; color: #999;">${date}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0 0 24px 0;" />
                                        
                                        <!-- Items -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                            <tr>
                                                <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eaeaea;">Description</td>
                                                <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-bottom: 1px solid #eaeaea;">Amount</td>
                                            </tr>
                                            ${items.map(item => `
                                            <tr>
                                                <td style="padding: 16px 0; font-size: 14px; color: #000; border-bottom: 1px solid #eaeaea;">${item.description}</td>
                                                <td style="padding: 16px 0; font-size: 14px; color: #000; text-align: right; border-bottom: 1px solid #eaeaea;">${item.amount} ${currency}</td>
                                            </tr>
                                            `).join('')}
                                        </table>
                                        
                                        <!-- Total -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 16px 0; font-size: 16px; font-weight: 600; color: #000;">Total</td>
                                                <td style="padding: 16px 0; font-size: 16px; font-weight: 600; color: #000; text-align: right;">${amount} ${currency}</td>
                                            </tr>
                                        </table>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">Thank you for using Pictura AI.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  captchaWelcome: (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PicturaCAPTCHA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C27D4F; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Welcome to PicturaCAPTCHA</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Your PicturaCAPTCHA account is ready. You can now protect your forms and applications with our AI-powered CAPTCHA solution.</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Get started by adding the CAPTCHA widget to your website. Check out our documentation for integration guides.</p>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/captcha/docs" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">View Documentation</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
}
