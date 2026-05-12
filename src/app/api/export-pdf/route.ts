import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Vercel timeout extension

export async function POST(req: NextRequest) {
  console.log('[PDF Export] Request received')
  let browser = null

  try {
    const { html, css, paperSize, orientation, dimensions, metadata } = await req.json()

    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 })
    }

    // 1. LAUNCH BROWSER
    console.log('[PDF Export] Chromium launching...')
    
    // Determine if we are running in a local environment or Vercel
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL
    
    // Attempt to find chrome on Windows if local
    let executablePath = await chromium.executablePath()
    if (isLocal) {
      if (process.platform === 'win32') {
        executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      } else {
        // Fallback for other local OS if needed
        executablePath = '/usr/bin/google-chrome'
      }
    }

    browser = await puppeteer.launch({
      args: isLocal ? [] : (chromium as any).args,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
      executablePath,
      headless: true,
    } as any)

    const page = await browser.newPage()
    console.log('[PDF Export] Chromium launched')

    // 2. SET CONTENT & WAIT
    const origin = new URL(req.url).origin
    
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; }
            * { box-sizing: border-box; }
            @page { margin: 0; }
            ${css || ''}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `.replace(/src="\/api\/drive-image/g, `src="${origin}/api/drive-image`)

    console.log('[PDF Export] HTML injected')
    await page.setContent(fullHtml, {
      waitUntil: 'networkidle0' as any,
      timeout: 30000
    })

    // Ensure images are actually there
    try {
      await page.waitForSelector('img', { timeout: 5000 })
    } catch (e) {
      console.warn('[PDF Export] No images found or timeout waiting for images')
    }

    // 3. GENERATE PDF
    console.log('[PDF Export] PDF generating...')
    const pdfBuffer = await page.pdf({
      format: (paperSize || 'A4') as any,
      landscape: orientation === 'landscape',
      printBackground: true,
      preferCSSPageSize: true,
      timeout: 30000
    })

    console.log('[PDF Export] PDF generated successfully')

    // 4. RETURN RESPONSE
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="export.pdf"`,
      },
    })

  } catch (error: any) {
    console.error('[PDF Export] CRITICAL FAILURE:', error)
    return NextResponse.json({ error: error.message || 'PDF generation failed' }, { status: 500 })
  } finally {
    if (browser) {
      await browser.close()
      console.log('[PDF Export] Browser closed')
    }
  }
}
