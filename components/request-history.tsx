"use client"

import { Clock, ExternalLink, Search } from "lucide-react"
import type { Request } from "@/components/browser-interface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RequestHistoryProps {
  requests: Request[]
  onSelect: (request: Request) => void
}

export function RequestHistory({ requests, onSelect }: RequestHistoryProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Clock className="h-12 w-12 mb-4 opacity-50" />
        <p>No request history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Request History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requests.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium truncate flex items-center">
                {request.url.includes("google.com/search") ? (
                  <>
                    <Search className="h-4 w-4 mr-2 text-muted-foreground" />
                    {new URL(request.url).searchParams.get("q") || request.url}
                  </>
                ) : (
                  request.url
                )}
              </CardTitle>
              <div className="text-xs text-muted-foreground">{new Date(request.timestamp).toLocaleString()}</div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center text-sm mb-2">
                <span className="font-semibold mr-2">Method:</span> {request.method}
              </div>
              {request.response && (
                <div className="flex items-center text-sm">
                  <span className="font-semibold mr-2">Status:</span> {request.response.status}
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button variant="outline" size="sm" onClick={() => onSelect(request)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
