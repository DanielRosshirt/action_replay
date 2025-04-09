"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Request } from "@/components/browser-interface"

interface RequestViewerProps {
  request: Request
}

export function RequestViewer({ request }: RequestViewerProps) {
  const [activeTab, setActiveTab] = useState("response")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {request.method} {request.url}
        </CardTitle>
        <div className="text-sm text-muted-foreground">{new Date(request.timestamp).toLocaleString()}</div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="response">Response</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="request">Request</TabsTrigger>
          </TabsList>
          <TabsContent value="response" className="mt-4">
            {request.response ? (
              <div>
                <div className="mb-2">
                  <span className="font-semibold">Status:</span> {request.response.status}
                </div>
                <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[500px]">
                  <pre className="text-sm whitespace-pre-wrap">{request.response.body}</pre>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">No response data available</div>
            )}
          </TabsContent>
          <TabsContent value="headers" className="mt-4">
            {request.response ? (
              <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[500px]">
                <pre className="text-sm">
                  {Object.entries(request.response.headers).map(([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="font-semibold">{key}:</span> {value}
                    </div>
                  ))}
                </pre>
              </div>
            ) : (
              <div className="text-muted-foreground">No header data available</div>
            )}
          </TabsContent>
          <TabsContent value="request" className="mt-4">
            <div className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[500px]">
              <div className="mb-2">
                <span className="font-semibold">URL:</span> {request.url}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Method:</span> {request.method}
              </div>
              {request.headers && (
                <div className="mb-2">
                  <span className="font-semibold">Headers:</span>
                  <pre className="text-sm mt-1">
                    {Object.entries(request.headers).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </pre>
                </div>
              )}
              {request.body && (
                <div>
                  <span className="font-semibold">Body:</span>
                  <pre className="text-sm mt-1">{request.body}</pre>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
