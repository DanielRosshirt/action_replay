// DOM Elements
const startRecordingBtn = document.getElementById("start-recording")
const stopRecordingBtn = document.getElementById("stop-recording")
const saveChainBtn = document.getElementById("save-chain")
const clearChainBtn = document.getElementById("clear-chain")
const recordingStatus = document.getElementById("recording-status")
const requestsList = document.getElementById("requests-list")
const chainsList = document.getElementById("chains-list")
const requestDetails = document.getElementById("request-details")

// Tab navigation
const tabButtons = document.querySelectorAll(".tab-button")
const tabContents = document.querySelectorAll(".tab-content")

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Remove active class from all buttons and contents
    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    // Add active class to clicked button and corresponding content
    button.classList.add("active")
    const tabId = button.id.replace("tab-", "")
    document.getElementById(`${tabId}-panel`).classList.add("active")

    // Load data for the selected tab
    if (tabId === "chains") {
      loadSavedChains()
    } else if (tabId === "requests") {
      loadCurrentRequests()
    }
  })
})

// Check recording status on panel open
chrome.runtime.sendMessage({ action: "getRecordingStatus" }, (response) => {
  updateRecordingUI(response.isRecording)
})

// Load current requests on panel open
loadCurrentRequests()

// Event Listeners
startRecordingBtn.addEventListener("click", startRecording)
stopRecordingBtn.addEventListener("click", stopRecording)
saveChainBtn.addEventListener("click", saveChain)
clearChainBtn.addEventListener("click", clearChain)

// Functions
function startRecording() {
  chrome.runtime.sendMessage({ action: "startRecording" }, (response) => {
    if (response.success) {
      updateRecordingUI(true)
    }
  })
}

function stopRecording() {
  chrome.runtime.sendMessage({ action: "stopRecording" }, (response) => {
    if (response.success) {
      updateRecordingUI(false)
      loadCurrentRequests()
    }
  })
}

function saveChain() {
  const name = prompt("Enter a name for this chain:")
  if (name) {
    chrome.runtime.sendMessage({ action: "saveChain", name }, (response) => {
      if (response.success) {
        alert(`Chain "${name}" saved successfully!`)
        clearChain()
      } else {
        alert(`Error: ${response.error}`)
      }
    })
  }
}

function clearChain() {
  chrome.runtime.sendMessage({ action: "startRecording" }, () => {
    chrome.runtime.sendMessage({ action: "stopRecording" }, () => {
      updateRecordingUI(false)
      loadCurrentRequests()
    })
  })
}

function updateRecordingUI(isRecording) {
  if (isRecording) {
    startRecordingBtn.disabled = true
    stopRecordingBtn.disabled = false
    recordingStatus.textContent = "Recording..."
    recordingStatus.classList.add("recording")
  } else {
    startRecordingBtn.disabled = false
    stopRecordingBtn.disabled = true
    recordingStatus.textContent = "Not recording"
    recordingStatus.classList.remove("recording")
  }
}

function loadCurrentRequests() {
  chrome.runtime.sendMessage({ action: "getCurrentChain" }, (response) => {
    renderRequestsList(response.chain)
    saveChainBtn.disabled = response.chain.length === 0
    clearChainBtn.disabled = response.chain.length === 0
  })
}

function loadSavedChains() {
  chrome.runtime.sendMessage({ action: "getSavedChains" }, (response) => {
    renderChainsList(response.chains)
  })
}

function renderRequestsList(requests) {
  if (!requests || requests.length === 0) {
    requestsList.innerHTML = '<div class="empty-state">No requests recorded yet</div>'
    return
  }

  requestsList.innerHTML = ""

  requests.forEach((request) => {
    const requestEl = document.createElement("div")
    requestEl.className = "request-item"
    requestEl.dataset.id = request.id

    const urlEl = document.createElement("div")
    urlEl.className = "request-url"
    urlEl.textContent = request.url

    const metaEl = document.createElement("div")
    metaEl.className = "request-meta"

    const methodEl = document.createElement("span")
    methodEl.textContent = request.method

    const timeEl = document.createElement("span")
    timeEl.textContent = new Date(request.timestamp).toLocaleString()

    metaEl.appendChild(methodEl)
    metaEl.appendChild(timeEl)

    requestEl.appendChild(urlEl)
    requestEl.appendChild(metaEl)

    if (request.response) {
      const statusEl = document.createElement("div")
      statusEl.className = "request-status"
      statusEl.textContent = `Status: ${request.response.status}`
      requestEl.appendChild(statusEl)
    }

    requestEl.addEventListener("click", () => {
      // Remove selected class from all requests
      document.querySelectorAll(".request-item").forEach((el) => {
        el.classList.remove("selected")
      })

      // Add selected class to clicked request
      requestEl.classList.add("selected")

      // Show request details
      showRequestDetails(request)
    })

    requestsList.appendChild(requestEl)
  })
}

function renderChainsList(chains) {
  if (!chains || chains.length === 0) {
    chainsList.innerHTML = '<div class="empty-state">No saved chains</div>'
    return
  }

  chainsList.innerHTML = ""

  chains.forEach((chain) => {
    const chainEl = document.createElement("div")
    chainEl.className = "chain-item"

    const headerEl = document.createElement("div")
    headerEl.className = "chain-header"

    const nameEl = document.createElement("div")
    nameEl.className = "chain-name"
    nameEl.textContent = chain.name

    const actionsEl = document.createElement("div")
    actionsEl.className = "chain-actions"

    const runBtn = document.createElement("button")
    runBtn.className = "button primary"
    runBtn.textContent = "Run"
    runBtn.addEventListener("click", () => runChain(chain.id))

    const deleteBtn = document.createElement("button")
    deleteBtn.className = "button danger"
    deleteBtn.textContent = "Delete"
    deleteBtn.addEventListener("click", () => deleteChain(chain.id))

    actionsEl.appendChild(runBtn)
    actionsEl.appendChild(deleteBtn)

    headerEl.appendChild(nameEl)
    headerEl.appendChild(actionsEl)

    const metaEl = document.createElement("div")
    metaEl.className = "chain-meta"
    metaEl.textContent = `Created: ${new Date(chain.timestamp).toLocaleString()}`

    const requestsEl = document.createElement("div")
    requestsEl.className = "chain-requests"
    requestsEl.textContent = `${chain.requests.length} request${chain.requests.length !== 1 ? "s" : ""}`

    chainEl.appendChild(headerEl)
    chainEl.appendChild(metaEl)
    chainEl.appendChild(requestsEl)

    // Add click handler to show chain details
    chainEl.addEventListener("click", (e) => {
      if (e.target !== runBtn && e.target !== deleteBtn) {
        showChainDetails(chain)
      }
    })

    chainsList.appendChild(chainEl)
  })
}

function showRequestDetails(request) {
  requestDetails.innerHTML = ""

  // General info section
  const generalSection = document.createElement("div")
  generalSection.className = "details-section"

  const generalTitle = document.createElement("h3")
  generalTitle.textContent = "General Information"
  generalSection.appendChild(generalTitle)

  const generalTable = document.createElement("table")
  generalTable.className = "details-table"

  const generalRows = [
    { name: "URL", value: request.url },
    { name: "Method", value: request.method },
    { name: "Timestamp", value: new Date(request.timestamp).toLocaleString() },
    { name: "Type", value: request.type || "N/A" },
  ]

  generalRows.forEach((row) => {
    const tr = document.createElement("tr")

    const th = document.createElement("th")
    th.textContent = row.name

    const td = document.createElement("td")
    td.textContent = row.value

    tr.appendChild(th)
    tr.appendChild(td)
    generalTable.appendChild(tr)
  })

  generalSection.appendChild(generalTable)
  requestDetails.appendChild(generalSection)

  // Response section
  if (request.response) {
    const responseSection = document.createElement("div")
    responseSection.className = "details-section"

    const responseTitle = document.createElement("h3")
    responseTitle.textContent = "Response"
    responseSection.appendChild(responseTitle)

    const responseTable = document.createElement("table")
    responseTable.className = "details-table"

    const statusRow = document.createElement("tr")
    const statusTh = document.createElement("th")
    statusTh.textContent = "Status"
    const statusTd = document.createElement("td")
    statusTd.textContent = `${request.response.status} ${request.response.statusText || ""}`
    statusRow.appendChild(statusTh)
    statusRow.appendChild(statusTd)
    responseTable.appendChild(statusRow)

    responseSection.appendChild(responseTable)

    // Headers
    if (request.response.headers) {
      const headersTitle = document.createElement("h4")
      headersTitle.textContent = "Headers"
      headersTitle.style.marginTop = "12px"
      responseSection.appendChild(headersTitle)

      const headersPre = document.createElement("pre")
      headersPre.textContent = JSON.stringify(request.response.headers, null, 2)
      responseSection.appendChild(headersPre)
    }

    requestDetails.appendChild(responseSection)

    // Screenshot
    if (request.screenshot) {
      const screenshotSection = document.createElement("div")
      screenshotSection.className = "details-section"

      const screenshotTitle = document.createElement("h3")
      screenshotTitle.textContent = "Screenshot"
      screenshotSection.appendChild(screenshotTitle)

      const img = document.createElement("img")
      img.src = request.screenshot
      img.alt = "Page screenshot"
      img.className = "screenshot"
      screenshotSection.appendChild(img)

      requestDetails.appendChild(screenshotSection)
    }
  }
}

function showChainDetails(chain) {
  requestDetails.innerHTML = ""

  // Chain info section
  const chainSection = document.createElement("div")
  chainSection.className = "details-section"

  const chainTitle = document.createElement("h3")
  chainTitle.textContent = `Chain: ${chain.name}`
  chainSection.appendChild(chainTitle)

  const chainInfo = document.createElement("div")
  chainInfo.innerHTML = `
    <p><strong>Created:</strong> ${new Date(chain.timestamp).toLocaleString()}</p>
    <p><strong>Requests:</strong> ${chain.requests.length}</p>
  `
  chainSection.appendChild(chainInfo)

  requestDetails.appendChild(chainSection)

  // Requests list
  const requestsSection = document.createElement("div")
  requestsSection.className = "details-section"

  const requestsTitle = document.createElement("h3")
  requestsTitle.textContent = "Requests in Chain"
  requestsSection.appendChild(requestsTitle)

  chain.requests.forEach((request, index) => {
    const requestItem = document.createElement("div")
    requestItem.className = "request-item"
    requestItem.style.marginBottom = "8px"

    const requestHeader = document.createElement("div")
    requestHeader.className = "request-url"
    requestHeader.textContent = `${index + 1}. ${request.method} ${request.url}`

    const requestMeta = document.createElement("div")
    requestMeta.className = "request-meta"
    requestMeta.textContent = new Date(request.timestamp).toLocaleString()

    requestItem.appendChild(requestHeader)
    requestItem.appendChild(requestMeta)

    // Add click handler to show request details
    requestItem.addEventListener("click", () => {
      showRequestDetails(request)
    })

    requestsSection.appendChild(requestItem)
  })

  requestDetails.appendChild(requestsSection)
}

function runChain(chainId) {
  chrome.runtime.sendMessage({ action: "runChain", chainId }, (response) => {
    if (!response.success) {
      alert(`Error: ${response.error}`)
    }
  })
}

function deleteChain(chainId) {
  if (confirm("Are you sure you want to delete this chain?")) {
    chrome.runtime.sendMessage({ action: "deleteChain", chainId }, (response) => {
      if (response.success) {
        loadSavedChains()
      }
    })
  }
}

// Listen for updates from background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "requestCaptured" || message.action === "requestUpdated") {
    loadCurrentRequests()
  }
})
