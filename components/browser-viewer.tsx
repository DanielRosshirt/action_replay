"use client"

import { Loader2 } from "lucide-react"

interface BrowserViewerProps {
  screenshot: string | null
  isLoading: boolean
  url: string
}

export function BrowserViewer({ screenshot, isLoading, url }: BrowserViewerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading page...</span>
      </div>
    )
  }

  if (!screenshot) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">Enter a URL to start browsing</div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto p-4">
      <div className="flex flex-col items-center">
        <div className="text-sm text-muted-foreground mb-2">Chromium screenshot of {url}</div>
        <img
          src={screenshot || "/placeholder.svg"}
          alt={`Screenshot of ${url}`}
          className="border rounded shadow-sm max-w-full"
        />
      </div>
    </div>
  )
}
