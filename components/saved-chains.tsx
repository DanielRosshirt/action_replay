"use client"

import { Play, Trash2 } from "lucide-react"
import type { Chain } from "@/components/browser-interface"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SavedChainsProps {
  chains: Chain[]
  onRun: (chain: Chain) => void
  onDelete: (chainId: string) => void
}

export function SavedChains({ chains, onRun, onDelete }: SavedChainsProps) {
  if (chains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No saved chains yet</p>
        <p className="text-sm mt-2">Record a sequence of requests and save it as a chain</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Saved Request Chains</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {chains.map((chain) => (
          <Card key={chain.id}>
            <CardHeader>
              <CardTitle>{chain.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {chain.requests.length} request{chain.requests.length !== 1 ? "s" : ""}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {chain.requests.slice(0, 3).map((request, index) => (
                  <div key={index} className="text-sm truncate">
                    {index + 1}. {request.method} {request.url}
                  </div>
                ))}
                {chain.requests.length > 3 && (
                  <div className="text-sm text-muted-foreground">...and {chain.requests.length - 3} more</div>
                )}
              </div>
              {chain.requests[0]?.response?.screenshot && (
                <div className="mt-4 border rounded overflow-hidden h-24">
                  <img
                    src={chain.requests[0].response.screenshot || "/placeholder.svg"}
                    alt={`Screenshot of first request`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => onDelete(chain.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button size="sm" onClick={() => onRun(chain)}>
                <Play className="h-4 w-4 mr-2" />
                Run Chain
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
