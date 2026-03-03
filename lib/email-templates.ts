export const emailTemplates = {
  otp: (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Pictura AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden;">
                    <!-- Header with Logo -->
                    <tr style="background-color: #fafaf8;">
                        <td align="center" style="padding: 40px 20px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#c77d4a"/>
                                    <path d="M2 17L12 22L22 17" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span style="font-size: 24px; font-weight: 700; color: #1a1a1a;">Pictura</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Welcome to Pictura AI</h1>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #666; line-height: 1.6;">Hi ${name},</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #666; line-height: 1.6;">Your verification code is:</p>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #f8f7f4; border-radius: 8px; padding: 24px; margin: 32px 0; text-align: center;">
                                <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #c77d4a; font-family: 'Courier New', monospace;">${otp}</p>
                            </div>
                            
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #999;">This code will expire in 10 minutes</p>
                            
                            <p style="margin: 0 0 40px 0; font-size: 14px; color: #666; line-height: 1.6;">If you didn't request this code, you can safely ignore this email.</p>
                            
                            <!-- Security Notice -->
                            <div style="background-color: #fafaf8; border-left: 3px solid #c77d4a; padding: 16px; margin: 32px 0 0 0;">
                                <p style="margin: 0; font-size: 12px; color: #666;">Never share your verification code with anyone. Pictura team will never ask for your code.</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr style="background-color: #fafaf8; border-top: 1px solid #ebebeb;">
                        <td style="padding: 30px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #999;">© 2026 Pictura AI. All rights reserved.</p>
                            <p style="margin: 0; font-size: 12px;">
                                <a href="https://picturaai.sbs" style="color: #c77d4a; text-decoration: none; margin: 0 12px;">Website</a>
                                <a href="https://picturaai.sbs/blog" style="color: #c77d4a; text-decoration: none; margin: 0 12px;">Blog</a>
                                <a href="https://picturaai.sbs/contact" style="color: #c77d4a; text-decoration: none; margin: 0 12px;">Contact</a>
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
    <title>Welcome to Pictura AI - Developer Platform</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr style="background: linear-gradient(135deg, #f8f7f4 0%, #fafaf8 100%);">
                        <td align="center" style="padding: 40px 20px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#c77d4a"/>
                                    <path d="M2 17L12 22L22 17" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span style="font-size: 28px; font-weight: 700; color: #1a1a1a;">Pictura</span>
                            </div>
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Welcome to the Platform</h1>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #666; line-height: 1.6;">Hi ${name},</p>
                            <p style="margin: 0 0 16px 0; font-size: 15px; color: #666; line-height: 1.6;">Welcome to Pictura! Your developer account is now active. We've added <strong>${credits} ${currency}</strong> in free credits to your account.</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #666; line-height: 1.6;">Use these credits to integrate AI image generation into your applications. No credit card required to get started.</p>
                            
                            <!-- Credits Card -->
                            <div style="background: linear-gradient(135deg, #c77d4a 0%, #a85a2a 100%); border-radius: 12px; padding: 32px; margin: 32px 0; text-align: center; color: white;">
                                <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Available Credits</p>
                                <p style="margin: 0; font-size: 36px; font-weight: 700;">${credits} ${currency}</p>
                            </div>
                            
                            <h2 style="margin: 32px 0 16px 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Next Steps:</h2>
                            <ol style="margin: 0; padding-left: 20px; color: #666;">
                                <li style="margin-bottom: 12px;">
                                    <strong><a href="https://picturaai.sbs/developers/dashboard" style="color: #c77d4a; text-decoration: none;">Go to Your Dashboard</a></strong> - Create API keys and manage your projects
                                </li>
                                <li style="margin-bottom: 12px;">
                                    <strong>Read the <a href="https://picturaai.sbs/docs" style="color: #c77d4a; text-decoration: none;">Documentation</a></strong> - Learn how to use our API
                                </li>
                                <li style="margin-bottom: 12px;">
                                    <strong>Try the <a href="https://picturaai.sbs/studio" style="color: #c77d4a; text-decoration: none;">Studio</a></strong> - Experiment with image generation
                                </li>
                                <li style="margin-bottom: 0;">
                                    <strong>Install the SDK</strong> - Use our client library in your projects
                                </li>
                            </ol>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="https://picturaai.sbs/developers/dashboard" style="display: inline-block; background-color: #c77d4a; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                                    Open Dashboard
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr style="background-color: #fafaf8; border-top: 1px solid #ebebeb;">
                        <td style="padding: 30px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #999;">© 2026 Pictura AI. All rights reserved.</p>
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
    <title>Low Credits Alert - Pictura AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr style="background-color: #fafaf8;">
                        <td align="center" style="padding: 40px 20px;">
                            <div style="display: inline-flex; align-items: center; gap: 8px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#c77d4a"/>
                                    <path d="M2 17L12 22L22 17" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M2 12L12 17L22 12" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span style="font-size: 24px; font-weight: 700; color: #1a1a1a;">Pictura</span>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">Low Credits Alert</h1>
                            <p style="margin: 0 0 24px 0; font-size: 15px; color: #666; line-height: 1.6;">Hi ${name},</p>
                            <p style="margin: 0 0 32px 0; font-size: 15px; color: #666; line-height: 1.6;">Your Pictura AI account is running low on credits.</p>
                            
                            <!-- Alert Box -->
                            <div style="background-color: #fff5f0; border-left: 4px solid #ff6b35; padding: 20px; margin: 32px 0; border-radius: 6px;">
                                <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ff6b35;">Credits Remaining: ${creditsRemaining} ${currency}</p>
                            </div>
                            
                            <h2 style="margin: 24px 0 16px 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Add Credits to Continue</h2>
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Visit your dashboard to add more credits and keep generating images without interruption.</p>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <a href="https://picturaai.sbs/developers/dashboard/billing" style="display: inline-block; background-color: #c77d4a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Add Credits
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr style="background-color: #fafaf8; border-top: 1px solid #ebebeb;">
                        <td style="padding: 30px; text-align: center;">
                            <p style="margin: 0; font-size: 12px; color: #999;">© 2026 Pictura AI. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  invoice: (name: string, invoiceId: string, amount: number, currency: string, items: any[], date: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceId} - Pictura AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f7f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f7f4;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden;">
                    <!-- Header -->
                    <tr style="background-color: #fafaf8;">
                        <td style="padding: 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="left">
                                        <div style="display: inline-flex; align-items: center; gap: 8px;">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#c77d4a"/>
                                                <path d="M2 17L12 22L22 17" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M2 12L12 17L22 12" stroke="#c77d4a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            <span style="font-size: 22px; font-weight: 700; color: #1a1a1a;">Pictura</span>
                                        </div>
                                    </td>
                                    <td align="right">
                                        <p style="margin: 0; font-size: 24px; font-weight: 700; color: #1a1a1a;">INVOICE</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Invoice Details -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td width="50%">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Bill To</p>
                                        <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">${name}</p>
                                    </td>
                                    <td align="right">
                                        <table cellpadding="0" cellspacing="0" align="right">
                                            <tr>
                                                <td style="padding: 0 12px 8px 0; font-size: 12px; color: #999;">Invoice #</td>
                                                <td style="padding: 0 0 8px 0; font-size: 12px; color: #1a1a1a; font-weight: 600;">${invoiceId}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 0 12px 0 0; font-size: 12px; color: #999;">Date</td>
                                                <td style="padding: 0 0 0 0; font-size: 12px; color: #1a1a1a; font-weight: 600;">${date}</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Items Table -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 40px; border-collapse: collapse;">
                                <tr style="border-bottom: 2px solid #ebebeb;">
                                    <td style="padding: 12px 0; font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase;">Description</td>
                                    <td align="right" style="padding: 12px 0; font-size: 12px; font-weight: 600; color: #999; text-transform: uppercase;">Amount</td>
                                </tr>
                                ${items.map(item => `
                                <tr style="border-bottom: 1px solid #ebebeb;">
                                    <td style="padding: 16px 0; font-size: 14px; color: #666;">${item.description}</td>
                                    <td align="right" style="padding: 16px 0; font-size: 14px; color: #666;">${currency} ${item.amount.toFixed(2)}</td>
                                </tr>
                                `).join('')}
                            </table>
                            
                            <!-- Total -->
                            <div style="margin-top: 40px; padding-top: 24px; border-top: 2px solid #ebebeb;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="right">
                                            <p style="margin: 0 0 4px 0; font-size: 12px; color: #999;">Total Amount</p>
                                            <p style="margin: 0; font-size: 28px; font-weight: 700; color: #c77d4a;">${currency} ${amount.toFixed(2)}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr style="background-color: #fafaf8; border-top: 1px solid #ebebeb;">
                        <td style="padding: 30px; text-align: center;">
                            <p style="margin: 0 0 12px 0; font-size: 12px; color: #999;">Thank you for using Pictura AI!</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">© 2026 Pictura AI. All rights reserved.</p>
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
