import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

async function getDevFromSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('dev_session')?.value
  
  if (!sessionId) return null
  
  const sessions = await sql`
    SELECT d.id, d.name, d.email 
    FROM developer_sessions s
    JOIN developers d ON d.id = s.developer_id
    WHERE s.session_token = ${sessionId}
    AND s.expires_at > NOW()
  `
  
  return sessions[0] || null
}

// DELETE - Remove a site
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const dev = await getDevFromSession()
    if (!dev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Ensure the site belongs to this developer
    const result = await sql`
      DELETE FROM captcha_sites 
      WHERE id = ${id}::uuid AND developer_id = ${dev.id}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete site:', error)
    return NextResponse.json({ error: 'Failed to delete site' }, { status: 500 })
  }
}
