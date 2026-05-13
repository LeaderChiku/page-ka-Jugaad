import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel timeout extension

/**
 * Server-side pre-fetch all Drive images and convert to base64 data URIs.
 * This eliminates all auth/cookie dependency inside Puppeteer's isolated context.
 */
async function embedDriveImages(html: string): Promise<string> {
  // Match all /api/drive-image?fileId=... src attributes
  const fileIdRegex = /src="[^"]*\/api\/drive-image\?fileId=([^"&]+)[^"]*"/g
  const matches = [...html.matchAll(fileIdRegex)]

  if (matches.length === 0) {
    console.log('[PDF Export] No Drive images found in HTML to embed.')
    return html
  }

  console.log(`[PDF Export] Found ${matches.length} Drive images to embed as base64.`)

  // Get Google OAuth token from server-side Supabase session
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.provider_token || session?.user?.user_metadata?.google_provider_token

  if (!token) {
    console.error('[PDF Export] No provider token found in session. Images cannot be embedded.')
    return html
  }

  // Collect unique fileIds to avoid duplicate fetches
  const uniqueIds = [...new Set(matches.map(m => m[1]))]
  console.log(`[PDF Export] Fetching ${uniqueIds.length} unique images from Google Drive...`)

  const imageDataMap: Record<string, string> = {}

  await Promise.all(uniqueIds.map(async (fileId) => {
    try {
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
      const res = await fetch(driveUrl, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000)
      })

      if (!res.ok) {
        console.warn(`[PDF Export] Failed to fetch image ${fileId}: ${res.status} ${res.statusText}`)
        return
      }

      const contentType = res.headers.get('Content-Type') ?? 'image/png'
      const buffer = await res.arrayBuffer()
      const base64 = Buffer.from(buffer).toString('base64')
      imageDataMap[fileId] = `data:${contentType};base64,${base64}`
      console.log(`[PDF Export] Embedded image ${fileId} (${contentType}, ${buffer.byteLength} bytes)`)
    } catch (err) {
      console.error(`[PDF Export] Error fetching image ${fileId}:`, err)
    }
  }))

  // Replace all /api/drive-image?fileId=X URLs with data URIs
  let resolvedHtml = html
  for (const [fileId, dataUri] of Object.entries(imageDataMap)) {
    // Escape the fileId for use in regex
    const escapedId = fileId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const srcRegex = new RegExp(`src="[^"]*\\/api\\/drive-image\\?fileId=${escapedId}[^"]*"`, 'g')
    resolvedHtml = resolvedHtml.replace(srcRegex, `src="${dataUri}"`)
  }

  console.log(`[PDF Export] Successfully embedded ${Object.keys(imageDataMap).length}/${uniqueIds.length} images.`)
  return resolvedHtml
}

export async function POST(req: NextRequest) {
  console.log('[PDF Export] Request received')
  let browser = null

  try {
    const { html, css, paperSize, orientation } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 })
    }

    // STEP 1: PRE-FETCH & EMBED ALL IMAGES AS BASE64
    // This is done BEFORE launching Puppeteer so the headless browser never needs
    // to make any authenticated network requests for images.
    console.log('[PDF Export] Pre-fetching Drive images server-side...')
    const htmlWithEmbeddedImages = await embedDriveImages(html)

    // STEP 2: LAUNCH BROWSER
    console.log('[PDF Export] Chromium launching...')

    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL

    let executablePath = ''
    try {
      if (isLocal) {
        if (process.platform === 'win32') {
          executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        } else {
          executablePath = '/usr/bin/google-chrome'
        }
      } else {
        executablePath = await chromium.executablePath()
      }
      console.log(`[PDF Export] Executable path: ${executablePath}`)
    } catch (pathError: any) {
      throw new Error(`Failed to resolve Chromium path: ${pathError.message}`)
    }

    browser = await puppeteer.launch({
      args: isLocal ? [] : [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
      ],
      defaultViewport: { width: 794, height: 1123 },
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()
    console.log('[PDF Export] Chromium launched')

    // STEP 3: BUILD FULL HTML DOCUMENT
    const isPortrait = orientation !== 'landscape'
    const pageWidth = isPortrait ? '210mm' : '297mm'
    const pageHeight = isPortrait ? '297mm' : '210mm'

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              width: ${pageWidth};
              height: ${pageHeight};
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            @page {
              margin: 0;
              size: ${paperSize || 'A4'} ${orientation || 'portrait'};
            }
            #export-container {
              width: 100%;
              height: 100%;
              position: relative;
              overflow: hidden;
              background: white;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            /* Injected styles from the client */
            ${css || ''}
          </style>
        </head>
        <body>
          <div id="export-container">
            ${htmlWithEmbeddedImages}
          </div>
        </body>
      </html>
    `

    console.log('[PDF Export] HTML constructed. Setting page content...')

    // STEP 4: SET VIEWPORT + CONTENT
    await page.setViewport({
      width: isPortrait ? 794 : 1123,
      height: isPortrait ? 1123 : 794,
      deviceScaleFactor: 2,
    })

    // Since all images are now base64 data URIs, networkidle0 should be near-instant
    await page.setContent(fullHtml, {
      waitUntil: ['load', 'domcontentloaded'] as any,
      timeout: 30000
    })

    // Wait for fonts to be ready and give a moment for layout to settle
    await page.evaluate(() => document.fonts.ready)
    await new Promise(r => setTimeout(r, 300))

    // STEP 5: GENERATE PDF
    console.log('[PDF Export] Generating PDF buffer...')
    const pdfBuffer = await page.pdf({
      format: (paperSize || 'A4') as any,
      landscape: orientation === 'landscape',
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000
    })

    console.log('[PDF Export] PDF generated successfully')

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="pagekajugaad-${(paperSize || 'A4').toLowerCase()}.pdf"`,
        'Cache-Control': 'no-cache'
      },
    })

  } catch (error: any) {
    console.error('[PDF Export] CRITICAL FAILURE:', error)
    return NextResponse.json({
      error: error.message || 'PDF generation failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  } finally {
    if (browser) {
      await (browser as any).close()
      console.log('[PDF Export] Browser closed')
    }
  }
}
