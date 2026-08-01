import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, insufficientCredits } from '@/lib/api-key-auth'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth.ok) return auth.response

    const { developerId: developer_id, tier } = auth.context
    const body = await request.json()
    const { prompts, model = 'pi-1.0', style_preset, width = 1024, height = 1024 } = body

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return errorResponse('Prompts array is required', 400)
    }

    // Limit batch size based on tier
    const maxBatchSize = tier === 'enterprise' ? 50 : tier === 'pro' ? 20 : 10
    if (prompts.length > maxBatchSize) {
      return errorResponse(`Batch size exceeds limit. Max ${maxBatchSize} for ${tier} tier`, 400)
    }

    // Check credits (estimate 1 credit per image)
    const noCredits = insufficientCredits(auth.context, prompts.length, true)
    if (noCredits) return noCredits

    // Create batch job
    const batchResult = await sql`
      INSERT INTO batch_jobs (developer_id, total_images, prompts, model, style_preset, width, height, status)
      VALUES (${developer_id}, ${prompts.length}, ${JSON.stringify(prompts)}, ${model}, ${style_preset || null}, ${width}, ${height}, 'pending')
      RETURNING id
    `

    const batchId = batchResult[0].id

    // Start processing in background (in production, use a queue like Vercel KV or similar)
    processBatchJob(batchId, developer_id, prompts, model, style_preset, width, height)

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      status: 'pending',
      total_images: prompts.length,
      estimated_time_seconds: prompts.length * 5,
      status_url: `/api/v1/batch/${batchId}`
    })

  } catch (error) {
    return serverErrorResponse('Batch API error', error)
  }
}

// Background batch processing
async function processBatchJob(
  batchId: number,
  developerId: string,
  prompts: string[],
  model: string,
  stylePreset: string | null,
  width: number,
  height: number
) {
  try {
    await sql`UPDATE batch_jobs SET status = 'processing', started_at = NOW() WHERE id = ${batchId}`

    const results: { prompt: string; url?: string; error?: string }[] = []
    let completedCount = 0
    let failedCount = 0
    let totalCredits = 0

    for (const prompt of prompts) {
      try {
        // Call the internal generate endpoint
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate/text-to-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, model, style: stylePreset, width, height, internal: true, developerId })
        })

        if (response.ok) {
          const data = await response.json()
          results.push({ prompt, url: data.url })
          completedCount++
          totalCredits += 1
        } else {
          results.push({ prompt, error: 'Generation failed' })
          failedCount++
        }
      } catch {
        results.push({ prompt, error: 'Generation failed' })
        failedCount++
      }

      // Update progress
      await sql`
        UPDATE batch_jobs 
        SET completed_images = ${completedCount}, failed_images = ${failedCount}, results = ${JSON.stringify(results)}
        WHERE id = ${batchId}
      `
    }

    // Deduct credits
    await sql`UPDATE developers SET credits = credits - ${totalCredits} WHERE id = ${developerId}`

    // Mark as completed
    await sql`
      UPDATE batch_jobs 
      SET status = 'completed', completed_at = NOW(), credits_used = ${totalCredits}
      WHERE id = ${batchId}
    `

  } catch (error) {
    console.error('Batch processing error:', error)
    await sql`UPDATE batch_jobs SET status = 'failed', error_message = ${String(error)} WHERE id = ${batchId}`
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth.ok) return auth.response

    const { developerId: developer_id } = auth.context

    // Get recent batch jobs
    const jobs = await sql`
      SELECT id, status, total_images, completed_images, failed_images, model, 
             credits_used, created_at, started_at, completed_at
      FROM batch_jobs
      WHERE developer_id = ${developer_id}
      ORDER BY created_at DESC
      LIMIT 20
    `

    return NextResponse.json({ jobs })

  } catch (error) {
    return serverErrorResponse('Batch list error', error)
  }
}
