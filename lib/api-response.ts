import { NextResponse } from 'next/server'

/** JSON error body shared by every API route. */
export function errorResponse(
  message: string,
  status: number,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status })
}

/** Logs an unexpected failure and returns the generic 500 payload. */
export function serverErrorResponse(context: string, error: unknown): NextResponse {
  console.error(`${context}:`, error)
  return errorResponse('Internal server error', 500)
}
