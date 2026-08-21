import { NextRequest, NextResponse } from 'next/server'
import { generateToken } from '@/lib/email'
import { sql } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { githubId, login, name, email, avatarUrl, profileUrl } = await req.json()

    if (!githubId || !email) {
      return NextResponse.json({ error: 'GitHub ID and email are required' }, { status: 400 })
    }

    // Check if developer already exists by GitHub ID
    let developers = await sql`
      SELECT id, email, full_name, name, credits_balance, currency, github_id
      FROM developers
      WHERE github_id = ${githubId.toString()}
    `

    let developer

    if (developers.length > 0) {
      // Existing developer found by GitHub ID
      developer = developers[0]
      
      // Update GitHub info if needed
      await sql`
        UPDATE developers 
        SET github_username = ${login},
            avatar_url = ${avatarUrl},
            last_login = NOW()
        WHERE id = ${developer.id}
      `
    } else {
      // Check if developer exists by email
      developers = await sql`
        SELECT id, email, full_name, name, credits_balance, currency, github_id
        FROM developers
        WHERE email = ${email.toLowerCase()}
      `

      if (developers.length > 0) {
        // Link GitHub to existing account
        developer = developers[0]
        await sql`
          UPDATE developers 
          SET github_id = ${githubId.toString()},
              github_username = ${login},
              avatar_url = ${avatarUrl},
              last_login = NOW()
          WHERE id = ${developer.id}
        `
      } else {
        // Create new developer account
        const newDevelopers = await sql`
          INSERT INTO developers (
            email, 
            full_name, 
            name,
            github_id, 
            github_username,
            avatar_url,
            credits_balance,
            currency,
            created_at,
            last_login
          ) VALUES (
            ${email.toLowerCase()},
            ${name},
            ${login},
            ${githubId.toString()},
            ${login},
            ${avatarUrl},
            2.00,
            'USD',
            NOW(),
            NOW()
          )
          RETURNING id, email, full_name, name, credits_balance, currency, github_id
        `
        developer = newDevelopers[0]
      }
    }

    // Generate session token
    const token = generateToken(32)
    
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${developer.id}, ${token}, ${expiresAt.toISOString()})
    `

    return NextResponse.json({
      success: true,
      token,
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.full_name || developer.name || login,
        creditsBalance: parseFloat(developer.credits_balance) || 0,
        currency: developer.currency || 'USD',
        githubId: developer.github_id,
        avatarUrl,
        profileUrl,
      },
    })
  } catch (error) {
    console.error('GitHub login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
