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

    // Try high-res thumbnail first for best quality, fallback to uc?export=view
    const targetUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
    
    console.log(`[API drive-image] Proxifying request for fileId: ${fileId}`)
    const driveRes = await fetch(targetUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!driveRes.ok) {
      const statusText = driveRes.statusText
      console.error(`[API drive-image] Drive fetch failed: ${driveRes.status} ${statusText}`)
      
      // Fallback mechanism in case thumbnail endpoint fails for some specific file types
      console.log(`[API drive-image] Falling back to uc endpoint...`)
      const fallbackUrl = `https://drive.google.com/uc?export=view&id=${fileId}`
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        signal: AbortSignal.timeout(10000)
      })
      
      if (!fallbackRes.ok) {
         return NextResponse.json({ error: 'Failed to fetch image from Google Drive' }, { status: fallbackRes.status })
      }
      
      const fallbackBuffer = await fallbackRes.arrayBuffer()
      return new NextResponse(fallbackBuffer, {
        status: 200,
        headers: {
          'Content-Type': fallbackRes.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        }
      })
    }

    const buffer = await driveRes.arrayBuffer()
    const contentType = driveRes.headers.get('Content-Type') || 'image/jpeg'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Cache aggressively since Drive files don't change IDs
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    })

  } catch (error: any) {
    console.error('[API drive-image] Proxy error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
