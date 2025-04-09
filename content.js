// This content script can be used to interact with the page
// For example, to extract data or simulate user interactions

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getPageInfo") {
    // Get page information
    const pageInfo = {
      title: document.title,
      url: window.location.href,
      content: document.documentElement.outerHTML,
    }

    sendResponse(pageInfo)
  } else if (message.action === "simulateClick") {
    // Find the element by selector and click it
    const element = document.querySelector(message.selector)
    if (element) {
      element.click()
      sendResponse({ success: true })
    } else {
      sendResponse({ success: false, error: "Element not found" })
    }
  }

  // Return true to indicate that we will respond asynchronously
  return true
})
