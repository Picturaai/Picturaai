import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'
import { requireDeveloperSession } from '@/lib/developer-auth'

export async function POST(req: NextRequest) {
  try {
    const session = await requireDeveloperSession(req)
    if (!session.ok) return session.response

    const { amount, credits, planName, email, name } = await req.json()

    if (!amount || amount < 100) {
      return errorResponse('Minimum amount is 100 NGN', 400)
    }

    if (!email) {
      return errorResponse('Email is required', 400)
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
    if (!paystackSecretKey) {
      return errorResponse('Payment system not configured', 500)
    }

    const reference = `PICTURA-${session.developerId.substring(0, 8)}-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        amount: amount * 100, // Paystack uses kobo (1 NGN = 100 kobo)
        email: email,
        reference: reference,
        currency: 'NGN',
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'}/developers/dashboard?payment=success`,
        metadata: {
          developer_id: session.developerId,
          credits: credits,
          plan_name: planName,
          custom_fields: [
            { display_name: 'Plan', variable_name: 'plan', value: planName },
            { display_name: 'Credits', variable_name: 'credits', value: credits.toString() },
            { display_name: 'Customer', variable_name: 'customer', value: name || email },
          ]
        }
      }),
    })

    const data = await response.json()

    if (data.status && data.data?.authorization_url) {
      // Store pending transaction
      await sql`
        INSERT INTO credit_transactions (developer_id, type, amount, description, balance_after)
        SELECT ${session.developerId}, 'pending', ${credits}, ${`Pending: ${planName} (${reference})`}, credits_balance
        FROM developers WHERE id = ${session.developerId}
      `.catch(() => {})

      return NextResponse.json({
        success: true,
        authorizationUrl: data.data.authorization_url,
        reference: data.data.reference,
        accessCode: data.data.access_code,
      })
    } else {
      console.error('Paystack error:', data)
      return errorResponse(data.message || 'Payment initialization failed', 400)
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    return errorResponse('An error occurred while initializing payment', 500)
  }
}
