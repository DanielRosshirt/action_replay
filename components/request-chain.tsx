"use client"

import { Save, Trash2, X } from "lucide-react"
import type { Request } from "@/components/browser-interface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RequestChainProps {
  requests: Request[]
  onClear: () => void
  onSave: () => void
}

export function RequestChain({ requests, onClear, onSave }: RequestChainProps) {
  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No requests in current chain</p>
        <p className="text-sm mt-2">Browse to start recording requests</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Current Chain</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Chain
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recorded Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {requests.map((request, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div className="flex-1">
                  <div className="font-medium">
                    {index + 1}. {request.method} {request.url}
                  </div>
                  <div className="text-sm text-muted-foreground">{new Date(request.timestamp).toLocaleString()}</div>
                </div>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
