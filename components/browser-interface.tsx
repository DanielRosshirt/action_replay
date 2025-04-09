"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, ArrowRight, BookOpen, Clock, Code, Play, RefreshCw, Save, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestChain } from "@/components/request-chain"
import { RequestHistory } from "@/components/request-history"
import { RequestViewer } from "@/components/request-viewer"
import { SavedChains } from "@/components/saved-chains"
import { useToast } from "@/components/ui/use-toast"

export type Request = {
  id: string
  url: string
  method: string
  headers?: Record<string, string>
  body?: string
  timestamp: number
  response?: {
    status: number
    headers: Record<string, string>
    body: string
  }
}

export type Chain = {
  id: string
  name: string
  requests: Request[]
}

export type BrowserTab = {
  id: string
  url: string
  title: string
  history: string[]
  currentHistoryIndex: number
}

export function BrowserInterface() {
  const [url, setUrl] = useState("")
  const [activeTab, setActiveTab] = useState("browser")
  const [currentRequest, setCurrentRequest] = useState<Request | null>(null)
  const [requestHistory, setRequestHistory] = useState<Request[]>([])
  const [savedChains, setSavedChains] = useState<Chain[]>([])
  const [activeChain, setActiveChain] = useState<Request[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [responseContent, setResponseContent] = useState<string>("")
  const [browserTabs, setBrowserTabs] = useState<BrowserTab[]>([
    {
      id: "tab-1",
      url: "",
      title: "New Tab",
      history: [],
      currentHistoryIndex: -1,
    },
  ])
  const [activeTabId, setActiveTabId] = useState("tab-1")
  const contentRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Get the current browser tab
  const currentBrowserTab = browserTabs.find((tab) => tab.id === activeTabId) || browserTabs[0]

  // Update URL when tab changes
  useEffect(() => {
    if (currentBrowserTab) {
      setUrl(currentBrowserTab.url)
    }
  }, [activeTabId, currentBrowserTab])

  const handleNavigate = async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to navigate",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Format the URL properly
      let formattedUrl = url
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        formattedUrl = `https://${url}`
      }

      // Create a new request object
      const newRequest: Request = {
        id: Date.now().toString(),
        url: formattedUrl,
        method: "GET",
        timestamp: Date.now(),
      }

      // Make the actual request through our proxy API
      const response = await fetch("/api/proxy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: formattedUrl,
          method: "GET",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Update the request with the response
      newRequest.response = {
        status: data.status,
        headers: data.headers,
        body: data.content,
      }

      // Set the response content for display
      setResponseContent(data.content)

      // Update the browser tab history
      setBrowserTabs((prevTabs) =>
        prevTabs.map((tab) => {
          if (tab.id === activeTabId) {
            // Truncate forward history if we're not at the end
            const newHistory = tab.history.slice(0, tab.currentHistoryIndex + 1)
            newHistory.push(formattedUrl)

            return {
              ...tab,
              url: formattedUrl,
              title: formattedUrl, // Will be updated when page loads
              history: newHistory,
              currentHistoryIndex: newHistory.length - 1,
            }
          }
          return tab
        }),
      )

      // Add to request history
      setRequestHistory((prev) => [newRequest, ...prev])

      // Add to active chain if recording
      if (isRecording) {
        setActiveChain((prev) => [...prev, newRequest])
      }

      // Set current request for details view
      setCurrentRequest(newRequest)

      // Set the URL in the address bar
      setUrl(formattedUrl)

      // Try to extract title from HTML
      const titleMatch = data.content.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch && titleMatch[1]) {
        setBrowserTabs((prevTabs) =>
          prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              return {
                ...tab,
                title: titleMatch[1],
              }
            }
            return tab
          }),
        )
      }
    } catch (error) {
      console.error("Navigation error:", error)
      toast({
        title: "Navigation Error",
        description: error instanceof Error ? error.message : "Failed to navigate to the URL",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const goBack = () => {
    setBrowserTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId && tab.currentHistoryIndex > 0) {
          const newIndex = tab.currentHistoryIndex - 1
          return {
            ...tab,
            url: tab.history[newIndex],
            currentHistoryIndex: newIndex,
          }
        }
        return tab
      }),
    )
  }

  const goForward = () => {
    setBrowserTabs((prevTabs) =>
      prevTabs.map((tab) => {
        if (tab.id === activeTabId && tab.currentHistoryIndex < tab.history.length - 1) {
          const newIndex = tab.currentHistoryIndex + 1
          return {
            ...tab,
            url: tab.history[newIndex],
            currentHistoryIndex: newIndex,
          }
        }
        return tab
      }),
    )
  }

  const refresh = () => {
    if (currentBrowserTab.url) {
      handleNavigate()
    }
  }

  const addNewTab = () => {
    const newTabId = `tab-${Date.now()}`
    setBrowserTabs((prevTabs) => [
      ...prevTabs,
      {
        id: newTabId,
        url: "",
        title: "New Tab",
        history: [],
        currentHistoryIndex: -1,
      },
    ])
    setActiveTabId(newTabId)
    setUrl("")
  }

  const closeTab = (tabId: string) => {
    if (browserTabs.length === 1) {
      // Don't close the last tab, just clear it
      setBrowserTabs([
        {
          id: tabId,
          url: "",
          title: "New Tab",
          history: [],
          currentHistoryIndex: -1,
        },
      ])
      setUrl("")
      return
    }

    setBrowserTabs((prevTabs) => {
      const filteredTabs = prevTabs.filter((tab) => tab.id !== tabId)
      // If we're closing the active tab, activate another one
      if (tabId === activeTabId) {
        setActiveTabId(filteredTabs[0].id)
        setUrl(filteredTabs[0].url)
      }
      return filteredTabs
    })
  }

  const startRecording = () => {
    setIsRecording(true)
    setActiveChain([])
    toast({
      title: "Recording Started",
      description: "Your request chain is now being recorded",
    })
  }

  const stopRecording = () => {
    setIsRecording(false)
    toast({
      title: "Recording Stopped",
      description: `Recorded ${activeChain.length} request${activeChain.length !== 1 ? "s" : ""}`,
    })
  }

  const saveCurrentChain = (name: string) => {
    if (activeChain.length === 0) {
      toast({
        title: "Cannot Save Empty Chain",
        description: "Please record at least one request before saving",
        variant: "destructive",
      })
      return
    }

    const newChain: Chain = {
      id: Date.now().toString(),
      name,
      requests: [...activeChain],
    }

    setSavedChains((prev) => [...prev, newChain])
    setActiveChain([])
    toast({
      title: "Chain Saved",
      description: `Saved chain "${name}" with ${newChain.requests.length} request${newChain.requests.length !== 1 ? "s" : ""}`,
    })
  }

  const runChain = async (chain: Chain) => {
    setIsLoading(true)
    toast({
      title: "Running Chain",
      description: `Running "${chain.name}" with ${chain.requests.length} request${chain.requests.length !== 1 ? "s" : ""}`,
    })

    try {
      for (const request of chain.requests) {
        setUrl(request.url)
        setBrowserTabs((prevTabs) =>
          prevTabs.map((tab) => {
            if (tab.id === activeTabId) {
              const newHistory = [...tab.history.slice(0, tab.currentHistoryIndex + 1), request.url]
              return {
                ...tab,
                url: request.url,
                history: newHistory,
                currentHistoryIndex: newHistory.length - 1,
              }
            }
            return tab
          }),
        )

        // Make the actual request through our proxy API
        const response = await fetch("/api/proxy", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: request.url,
            method: request.method,
            headers: request.headers,
            body: request.body,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        setResponseContent(data.content)

        // Add a small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      toast({
        title: "Chain Completed",
        description: `Successfully ran all ${chain.requests.length} request${chain.requests.length !== 1 ? "s" : ""}`,
      })
    } catch (error) {
      console.error("Error running chain:", error)
      toast({
        title: "Chain Error",
        description: "Failed to complete the request chain",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const canGoBack = currentBrowserTab.currentHistoryIndex > 0
  const canGoForward = currentBrowserTab.currentHistoryIndex < currentBrowserTab.history.length - 1

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b p-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goBack} disabled={!canGoBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goForward} disabled={!canGoForward}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={refresh} disabled={!currentBrowserTab.url}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="flex-1 flex items-center border rounded-md overflow-hidden">
            <Input
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Enter URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
            />
            {url && (
              <Button variant="ghost" size="icon" onClick={() => setUrl("")}>
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={handleNavigate} disabled={isLoading}>
              {isLoading ? "Loading..." : "Go"}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {isRecording ? (
              <Button variant="destructive" size="sm" onClick={stopRecording}>
                Stop Recording
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={startRecording}>
                <Play className="h-4 w-4 mr-2" />
                Record Chain
              </Button>
            )}
            {activeChain.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const name = prompt("Enter a name for this chain")
                  if (name) saveCurrentChain(name)
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Chain
              </Button>
            )}
          </div>
        </div>

        {/* Browser Tabs */}
        <div className="flex items-center mt-2 border-t pt-2 overflow-x-auto">
          {browserTabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center min-w-[150px] max-w-[200px] h-8 px-3 mr-1 rounded-t-md cursor-pointer ${
                tab.id === activeTabId ? "bg-background border-b-0 border border-border" : "bg-muted"
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              <div className="flex-1 truncate text-sm">{tab.title}</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={addNewTab}>
            <span className="text-lg font-bold">+</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="browser"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browser
            </TabsTrigger>
            <TabsTrigger
              value="devtools"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Code className="h-4 w-4 mr-2" />
              DevTools
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Clock className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="chains"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              <Play className="h-4 w-4 mr-2" />
              Saved Chains
            </TabsTrigger>
            {isRecording && (
              <TabsTrigger
                value="recording"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                <Save className="h-4 w-4 mr-2" />
                Current Chain
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        <TabsContent value="browser" className="flex-1 p-0 m-0">
          <div className="h-full w-full overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                <span className="ml-2">Loading...</span>
              </div>
            ) : currentBrowserTab.url ? (
              <div className="p-4">
                <div className="mb-4 text-sm text-muted-foreground">
                  <strong>Note:</strong> Due to browser security restrictions, we can't render the actual page. Below is
                  the raw HTML response.
                </div>
                <div
                  ref={contentRef}
                  className="border rounded-md p-4 bg-muted/50 overflow-auto max-h-[calc(100vh-200px)]"
                >
                  <pre className="text-sm whitespace-pre-wrap">{responseContent}</pre>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <BookOpen className="h-16 w-16 mb-4 opacity-30" />
                <p className="text-xl font-medium mb-2">Enter a URL to start browsing</p>
                <p className="text-sm max-w-md text-center">
                  Type a website address in the URL bar above and press Enter or click Go
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="devtools" className="flex-1 p-4 m-0">
          {currentRequest ? (
            <RequestViewer request={currentRequest} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Code className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-xl font-medium mb-2">No request data available</p>
              <p className="text-sm max-w-md text-center">Navigate to a website to see request details here</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="history" className="flex-1 p-4 m-0">
          <RequestHistory
            requests={requestHistory}
            onSelect={(req) => {
              setCurrentRequest(req)
              setUrl(req.url)
              setBrowserTabs((prevTabs) =>
                prevTabs.map((tab) => {
                  if (tab.id === activeTabId) {
                    const newHistory = [...tab.history.slice(0, tab.currentHistoryIndex + 1), req.url]
                    return {
                      ...tab,
                      url: req.url,
                      history: newHistory,
                      currentHistoryIndex: newHistory.length - 1,
                    }
                  }
                  return tab
                }),
              )

              // Set the response content if available
              if (req.response) {
                setResponseContent(req.response.body)
              }

              setActiveTab("browser")
            }}
          />
        </TabsContent>
        <TabsContent value="chains" className="flex-1 p-4 m-0">
          <SavedChains
            chains={savedChains}
            onRun={runChain}
            onDelete={(chainId) => {
              setSavedChains((prev) => prev.filter((chain) => chain.id !== chainId))
            }}
          />
        </TabsContent>
        <TabsContent value="recording" className="flex-1 p-4 m-0">
          <RequestChain
            requests={activeChain}
            onClear={() => setActiveChain([])}
            onSave={() => {
              const name = prompt("Enter a name for this chain")
              if (name) saveCurrentChain(name)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
