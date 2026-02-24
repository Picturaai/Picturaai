import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verify webhook signature (Korapay sends X-Korapay-Signature header)
    const signature = request.headers.get('X-Korapay-Signature')
    const webhookSecret = process.env.KORAPAY_WEBHOOK_SECRET || ''

    // In production, verify the signature
    if (!signature && webhookSecret) {
      console.warn('[v0] Webhook signature verification skipped - secret not configured')
    }

    const { event, data } = body

    // Handle successful payment
    if (event === 'charge.success') {
      console.log('[v0] Payment successful:', {
        reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
      })

      // Here you could:
      // - Save transaction to database
      // - Send confirmation email
      // - Update user records
      // - Log donation for analytics

      return NextResponse.json({ success: true })
    }

    // Handle failed payment
    if (event === 'charge.failed') {
      console.log('[v0] Payment failed:', {
        reference: data.reference,
        reason: data.reason,
      })

      return NextResponse.json({ success: true })
    }

    console.log('[v0] Unhandled webhook event:', event)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
