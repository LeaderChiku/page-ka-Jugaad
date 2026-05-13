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
    if (isLocal) {
      if (process.platform === 'win32') {
        executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      } else {
        executablePath = '/usr/bin/google-chrome'
      }
    } else {
      executablePath = await chromium.executablePath()
    }

    browser = await puppeteer.launch({
      args: isLocal ? [] : chromium.args,
      defaultViewport: chromium.defaultViewport || { width: 1280, height: 720 },
      executablePath,
      headless: chromium.headless,
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
    const origin = new URL(req.url).origin
    
    // Construct full HTML document with injected styles
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            /* Base styles for PDF rendering */
            body { 
              margin: 0; 
              padding: 0; 
              background: white; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            * { box-sizing: border-box; }
            @page { margin: 0; }
            
            /* Injected styles from the client */
            ${css || ''}
          </style>
        </head>
        <body>
          <div style="width: ${dimensions?.width || '100%'}; height: ${dimensions?.height || '100%'};">
            ${html}
          </div>
        </body>
      </html>
    `.replace(/src="\/api\/drive-image/g, `src="${origin}/api/drive-image`)

    console.log('[PDF Export] HTML prepared and URLs resolved')
    
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0' as any,
      timeout: 30000
    })

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
