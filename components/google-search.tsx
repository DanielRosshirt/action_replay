"use client"

import { useState } from "react"
import { Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface GoogleSearchProps {
  query: string
  isLoading: boolean
  onSearch: (query: string) => void
  onLinkClick: (url: string) => void
}

export function GoogleSearch({ query, isLoading, onSearch, onLinkClick }: GoogleSearchProps) {
  const [localQuery, setLocalQuery] = useState(query)

  // Mock search results
  const generateSearchResults = (query: string) => {
    if (!query) return []

    return [
      {
        title: `${query} - Official Website`,
        url: `https://www.${query.toLowerCase().replace(/\s+/g, "")}.com`,
        description: `The official website for ${query}. Find all the information you need about ${query} and related topics.`,
      },
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, "_")}`,
        description: `${query} is a term that refers to... Read more about the history, development, and significance of ${query}.`,
      },
      {
        title: `Top 10 Facts About ${query} - InfoSite`,
        url: `https://www.infosite.com/facts-about-${query.toLowerCase().replace(/\s+/g, "-")}`,
        description: `Discover the most interesting facts about ${query} that you probably didn't know. Our experts have compiled a comprehensive list.`,
      },
      {
        title: `${query} News - Latest Updates`,
        url: `https://news.example.com/topics/${query.toLowerCase().replace(/\s+/g, "-")}`,
        description: `Stay updated with the latest news and developments related to ${query}. Breaking stories, analysis, and expert opinions.`,
      },
      {
        title: `Learn About ${query} - Educational Resource`,
        url: `https://learn.example.org/subjects/${query.toLowerCase().replace(/\s+/g, "-")}`,
        description: `Comprehensive educational materials about ${query}. Perfect for students, researchers, and anyone interested in learning more.`,
      },
    ]
  }

  const searchResults = generateSearchResults(query)

  if (!query && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="mb-8">
          <img
            src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png"
            alt="Google"
            className="h-24 w-auto"
          />
        </div>
        <div className="w-full max-w-xl">
          <div className="flex items-center border rounded-full overflow-hidden shadow-sm mb-6">
            <Search className="h-5 w-5 ml-4 text-gray-400" />
            <Input
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Search Google or type a URL"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch(localQuery)}
            />
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onSearch(localQuery)}
              className="bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
            >
              Google Search
            </Button>
            <Button
              variant="outline"
              className="bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
              onClick={() => {
                const randomQueries = [
                  "cats",
                  "weather",
                  "news",
                  "recipes",
                  "travel destinations",
                  "programming",
                  "music",
                ]
                const randomQuery = randomQueries[Math.floor(Math.random() * randomQueries.length)]
                setLocalQuery(randomQuery)
                onSearch(randomQuery)
              }}
            >
              I'm Feeling Lucky
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto p-4">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Searching...</span>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center border rounded-full overflow-hidden shadow-sm mb-4">
              <Search className="h-5 w-5 ml-4 text-gray-400" />
              <Input
                className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search Google or type a URL"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch(localQuery)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              About {Math.floor(Math.random() * 10000000).toLocaleString()} results (
              {(Math.random() * 0.5 + 0.1).toFixed(2)} seconds)
            </div>
          </div>

          <div className="space-y-6">
            {searchResults.map((result, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="text-sm text-muted-foreground">{result.url}</div>
                <h3 className="text-blue-600 hover:underline text-xl font-medium mt-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onLinkClick(result.url)
                    }}
                  >
                    {result.title}
                  </a>
                </h3>
                <p className="text-sm mt-1">{result.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
