import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Add request ID for tracking
  const requestId = crypto.randomUUID()
  response.headers.set('X-Request-ID', requestId)

  return response
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
} 