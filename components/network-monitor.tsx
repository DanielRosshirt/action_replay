"use client"

import { Code, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Request } from "@/components/browser-interface"

interface NetworkMonitorProps {
  url: string
  requests: Request[]
  onRequestSelect: (request: Request) => void
}

export function NetworkMonitor({ url, requests, onRequestSelect }: NetworkMonitorProps) {
  return (
    <div className="h-full overflow-auto p-4">
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Network Monitor: {url}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This panel shows all network requests made to this URL. Click on a request to view its details.
          </p>

          <Tabs defaultValue="requests">
            <TabsList>
              <TabsTrigger value="requests">Requests</TabsTrigger>
              <TabsTrigger value="headers">Headers</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="requests" className="mt-4">
              {requests.length > 0 ? (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => onRequestSelect(request)}
                    >
                      <div className="flex items-center">
                        <Code className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {request.method} {new URL(request.url).pathname}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(request.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No requests captured yet</div>
              )}
            </TabsContent>
            <TabsContent value="headers" className="mt-4">
              {requests.length > 0 ? (
                <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[500px]">
                  <pre className="text-sm">
                    {Object.entries(requests[0].response?.headers || {}).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No request data available</div>
              )}
            </TabsContent>
            <TabsContent value="response" className="mt-4">
              {requests.length > 0 && requests[0].response ? (
                <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[500px]">
                  <pre className="text-sm whitespace-pre-wrap">{requests[0].response.body}</pre>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No response data available</div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="border rounded-md p-4 bg-muted/50">
        <h3 className="font-medium mb-2">Page Content Simulation</h3>
        <p className="text-sm mb-4">
          This is a simulated view of the page content. In a real implementation, this would show the actual page
          content.
        </p>
        <div className="border-t pt-4">
          <h2 className="text-xl font-bold mb-2">Content from {url}</h2>
          <p>This is simulated content for {url}. The actual content would be displayed here.</p>
        </div>
      </div>
    </div>
  )
}
