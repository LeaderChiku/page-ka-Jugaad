import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel timeout extension

export async function POST(req: NextRequest) {
  console.log('[PDF Export] Request received')
  let browser = null

  try {
    const { html, css, paperSize, orientation, dimensions, metadata, cookies } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 })
    }

    // 1. LAUNCH BROWSER
    console.log('[PDF Export] Chromium launching...')
    
    // Determine if we are running in a local environment or Vercel
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
        // Explicitly set the binary path if available, or let the package resolve it
        executablePath = await chromium.executablePath()
      }
      console.log(`[PDF Export] Executable path resolved: ${executablePath}`)
    } catch (pathError: any) {
      console.error('[PDF Export] Path resolution error:', pathError)
      throw new Error(`Failed to resolve Chromium path: ${pathError.message}`)
    }

    browser = await puppeteer.launch({
      args: isLocal ? [] : [
        ...chromium.args, 
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--force-device-scale-factor=4', 
        '--high-dpi-support=1'
      ],
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()
    console.log('[PDF Export] Chromium launched')
    
    // 1.5 SET AUTH COOKIES
    // This is critical so Puppeteer can fetch images from /api/drive-image 
    // which requires a Supabase session.
    if (cookies) {
      const domain = new URL(req.url).hostname
      const cookieList = cookies.split(';').map((c: string) => {
        const [name, ...valueParts] = c.split('=').map(s => s.trim());
        return { 
          name, 
          value: valueParts.join('='), 
          domain,
          path: '/' 
        };
      }).filter((c: any) => c.name && c.value);
      
      await page.setCookie(...cookieList)
      console.log(`[PDF Export] Injected ${cookieList.length} auth cookies into Puppeteer`)
    }

    // 2. SET CONTENT & WAIT
    // Use the request host to build a reliable absolute origin for image fetching
    const protocol = req.headers.get('x-forwarded-proto') || 'http'
    const host = req.headers.get('host')
    const origin = `${protocol}://${host}`
    
    // Construct full HTML document with injected styles
    // We use mm units for the container to ensure it fills the A4 page correctly
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
            /* Base styles for PDF rendering */
            html, body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              width: ${pageWidth};
              height: ${pageHeight};
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
              color-interpolation-filters: sRGB;
            }
            * { box-sizing: border-box; }
            @page { 
              margin: 0; 
              size: ${paperSize || 'A4'} ${orientation || 'portrait'};
            }
            
            /* Ensure the layout container fills the paper */
            #export-container {
              width: 100%;
              height: 100%;
              position: relative;
              overflow: hidden;
            }

            /* Standard image rendering for better compositing */
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }

            /* Injected styles from the client */
            ${css || ''}
          </style>
        </head>
        <body>
          <div id="export-container">
            ${html}
          </div>
        </body>
      </html>
    `
    // Robust Absolute URL Resolution
    // We catch all src="/..." and replace with the full origin
    const resolvedHtml = fullHtml.replace(/src="\/api\/drive-image\?id=([^"]+)"/g, (match, id) => {
      const absoluteUrl = `${origin}/api/drive-image?id=${id}`
      console.log(`[PDF Export] Resolving image ID ${id} -> ${absoluteUrl}`)
      return `src="${absoluteUrl}"`
    })

    console.log('[PDF Export] HTML prepared and URLs resolved')
    
    // Use a high-res viewport matching the A4 aspect ratio
    await page.setViewport({
      width: isPortrait ? 794 : 1123, // A4 at 96 DPI
      height: isPortrait ? 1123 : 794,
      deviceScaleFactor: 2, 
    })

    await page.setContent(resolvedHtml, {
      waitUntil: ['networkidle0', 'load', 'domcontentloaded'] as any,
      timeout: 30000
    })

    // CRITICAL: Wait for all images to be fully loaded and decoded
    console.log('[PDF Export] Waiting for images and fonts...')
    const debugStats = await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'))
      await Promise.all([
        document.fonts.ready,
        ...images.map(img => {
          if (img.complete) return Promise.resolve()
          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
        })
      ])
      return { 
        imageCount: images.length,
        visibleImages: images.filter(img => img.offsetWidth > 0).length,
        sources: images.map(img => img.src.substring(0, 50) + '...')
      }
    })
    console.log('[PDF Export] Render Stats:', debugStats)

    // DEBUG: Take a screenshot to verify what Puppeteer "sees"
    if (process.env.NODE_ENV === 'development') {
      await page.screenshot({ path: 'debug-export-render.png', fullPage: true })
      console.log('[PDF Export] Debug screenshot saved to debug-export-render.png')
    }

    // Give a small extra buffer for any CSS transitions or final layout shifts
    await new Promise(r => setTimeout(r, 1000))

    // 3. GENERATE PDF
    console.log('[PDF Export] Generating PDF buffer...')
    const pdfBuffer = await page.pdf({
      format: (paperSize || 'A4') as any,
      landscape: orientation === 'landscape',
      printBackground: true,
      preferCSSPageSize: false, // We rely on the paperSize format
      timeout: 30000
    })

    console.log('[PDF Export] PDF generated successfully')

    // 4. RETURN RESPONSE
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="export.pdf"`,
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
