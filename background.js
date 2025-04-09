// Global state
let isRecording = false
let currentChain = []
let savedChains = []
const requestMap = new Map()

// Initialize from storage
chrome.storage.local.get(["savedChains"], (result) => {
  if (result.savedChains) {
    savedChains = result.savedChains
  }
})

// Listen for network requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (isRecording && details.type === "main_frame") {
      const request = {
        id: details.requestId,
        url: details.url,
        method: details.method,
        timestamp: Date.now(),
        tabId: details.tabId,
        type: details.type,
        requestBody: details.requestBody,
      }

      requestMap.set(details.requestId, request)
      currentChain.push(request)

      // Notify popup about the new request
      chrome.runtime.sendMessage({
        action: "requestCaptured",
        request: request,
      })
    }
    return { cancel: false }
  },
  { urls: ["<all_urls>"] },
  ["requestBody"],
)

// Capture response data
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (requestMap.has(details.requestId)) {
      const request = requestMap.get(details.requestId)
      request.response = {
        status: details.statusCode,
        statusText: details.statusLine,
        headers: details.responseHeaders,
      }

      // Take a screenshot if it's a main frame request
      if (details.type === "main_frame") {
        chrome.tabs.captureVisibleTab(details.tabId, { format: "png" }, (dataUrl) => {
          request.screenshot = dataUrl

          // Update the request in the map
          requestMap.set(details.requestId, request)

          // Update the request in the current chain
          const index = currentChain.findIndex((req) => req.id === details.requestId)
          if (index !== -1) {
            currentChain[index] = request
          }

          // Notify popup about the updated request
          chrome.runtime.sendMessage({
            action: "requestUpdated",
            request: request,
          })
        })
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"],
)

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case "startRecording":
      isRecording = true
      currentChain = []
      sendResponse({ success: true })
      break

    case "stopRecording":
      isRecording = false
      sendResponse({ success: true, requestCount: currentChain.length })
      break

    case "getCurrentChain":
      sendResponse({ chain: currentChain })
      break

    case "saveChain":
      if (currentChain.length > 0) {
        const newChain = {
          id: Date.now().toString(),
          name: message.name,
          requests: [...currentChain],
          timestamp: Date.now(),
        }

        savedChains.push(newChain)

        // Save to storage
        chrome.storage.local.set({ savedChains: savedChains })

        sendResponse({ success: true, chain: newChain })
      } else {
        sendResponse({ success: false, error: "No requests in current chain" })
      }
      break

    case "getSavedChains":
      sendResponse({ chains: savedChains })
      break

    case "deleteChain":
      savedChains = savedChains.filter((chain) => chain.id !== message.chainId)
      chrome.storage.local.set({ savedChains: savedChains })
      sendResponse({ success: true })
      break

    case "runChain":
      const chain = savedChains.find((chain) => chain.id === message.chainId)
      if (chain) {
        runChain(chain)
          .then(() => {
            sendResponse({ success: true })
          })
          .catch((error) => {
            sendResponse({ success: false, error: error.message })
          })
        return true // Keep the message channel open for the async response
      } else {
        sendResponse({ success: false, error: "Chain not found" })
      }
      break

    case "getRecordingStatus":
      sendResponse({ isRecording })
      break
  }
})

// Function to run a saved chain
async function runChain(chain) {
  for (const request of chain.requests) {
    // Open a new tab with the URL
    const tab = await chrome.tabs.create({ url: request.url, active: true })

    // Wait for the page to load
    await new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      })
    })

    // Wait a bit to ensure everything is loaded
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
}
