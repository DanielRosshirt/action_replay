import { NextResponse } from "next/server"

// Mock browser functionality since we can't use actual Playwright in the Vercel preview environment
export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: string
    try {
      // Make sure URL has a protocol
      validUrl = url.startsWith("http") ? url : `https://${url}`
      new URL(validUrl) // This will throw if URL is invalid
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Simulate fetching the page
    // In a real implementation, this would use Playwright
    const response = await fetch(validUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }).catch((error) => {
      console.error("Fetch error:", error)
      return null
    })

    if (!response) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
    }

    // Get response details
    const status = response.status
    const headers: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      headers[key] = value
    })

    // Get content as text
    const content = await response.text()

    // Generate a placeholder screenshot
    // In a real implementation, this would be a real screenshot from Playwright
    const placeholderScreenshot = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <rect width="800" height="600" fill="#f5f5f5"/>
        <text x="400" y="300" font-family="Arial" font-size="24" text-anchor="middle">
          Screenshot of ${validUrl}
        </text>
      </svg>`,
    )}`

    return NextResponse.json({
      status,
      headers,
      content,
      screenshot: placeholderScreenshot,
    })
  } catch (error) {
    console.error("Browser API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
