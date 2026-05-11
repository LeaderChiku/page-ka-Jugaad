import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get('fileId')
    
    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 })
    }

    // Securely retrieve the provider_token from the server-side session
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    const token = session?.provider_token

    if (error || !token) {
      console.error('[API drive-image] Unauthorized or missing provider_token')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use the official REST API endpoint to securely fetch raw file bytes (bypasses all redirects)
    const targetUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    
    console.log(`[API drive-image] Fetching from: ${targetUrl}`)
    const driveRes = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(15000)
    })

    console.log(`[API drive-image] Response Status: ${driveRes.status} ${driveRes.statusText}`)
    const contentType = driveRes.headers.get('Content-Type')
    console.log(`[API drive-image] Content-Type: ${contentType}`)

    if (!driveRes.ok) {
      const errText = await driveRes.text()
      console.error(`[API drive-image] Drive fetch failed. Body:`, errText.substring(0, 200))
      return NextResponse.json({ error: 'Failed to fetch image from Google Drive', details: errText.substring(0, 100) }, { status: driveRes.status })
    }

    if (contentType?.includes('text/html')) {
      console.error(`[API drive-image] Warning: Received HTML instead of image data!`)
      return NextResponse.json({ error: 'Received HTML instead of image data' }, { status: 502 })
    }

    const buffer = await driveRes.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType ?? 'image/jpeg',
        // Cache aggressively since Drive files don't change IDs
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    })

  } catch (error: any) {
    console.error('[API drive-image] Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
