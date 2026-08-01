import { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'
import { DEVELOPER_SESSION_COOKIE, getAuthenticatedDeveloperId } from '@/lib/developer-auth'

export async function PATCH(req: NextRequest) {
  try {
    const developerId = await getAuthenticatedDeveloperId(req)
    if (!developerId) return errorResponse('Unauthorized', 401)

    const { name } = await req.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return errorResponse('Name is required', 400)
    }

    const safeName = name.trim().slice(0, 80)

    await sql`
      UPDATE developers
      SET name = ${safeName}, full_name = ${safeName}
      WHERE id = ${developerId}
    `

    return NextResponse.json({ success: true, name: safeName })
  } catch (error) {
    console.error('Update profile error:', error)
    return errorResponse('Failed to update profile', 500)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const developerId = await getAuthenticatedDeveloperId(req)
    if (!developerId) return errorResponse('Unauthorized', 401)

    const deletedEmail = `deleted+${developerId.slice(0, 8)}-${Date.now()}@pictura.local`

    await sql`DELETE FROM developer_sessions WHERE developer_id = ${developerId}`
    await sql`UPDATE api_keys SET is_active = false WHERE developer_id = ${developerId}`
    await sql`
      UPDATE developers
      SET
        name = 'Deleted User',
        full_name = 'Deleted User',
        email = ${deletedEmail},
        credits = 0,
        credits_balance = 0,
        tier = 'free'
      WHERE id = ${developerId}
    `

    const response = NextResponse.json({ success: true })
    response.cookies.delete(DEVELOPER_SESSION_COOKIE)
    return response
  } catch (error) {
    console.error('Delete profile error:', error)
    return errorResponse('Failed to delete account', 500)
  }
}
