import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, method = "GET", headers = {}, body } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL format
    let validUrl: string
    try {
      validUrl = url.startsWith("http") ? url : `https://${url}`
      new URL(validUrl) // This will throw if URL is invalid
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Create fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: {
        ...headers,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    }

    if (body && method !== "GET" && method !== "HEAD") {
      fetchOptions.body = body
    }

    // Make the actual request
    const response = await fetch(validUrl, fetchOptions).catch((error) => {
      console.error("Fetch error:", error)
      return null
    })

    if (!response) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 500 })
    }

    // Get response details
    const status = response.status
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Get content as text
    const content = await response.text()

    return NextResponse.json({
      status,
      headers: responseHeaders,
      content,
      url: validUrl,
    })
  } catch (error) {
    console.error("Proxy API error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
