// DOM Elements
const startRecordingBtn = document.getElementById("start-recording")
const stopRecordingBtn = document.getElementById("stop-recording")
const saveChainBtn = document.getElementById("save-chain")
const clearChainBtn = document.getElementById("clear-chain")
const recordingStatus = document.getElementById("recording-status")
const currentRequests = document.getElementById("current-requests")
const chainsList = document.getElementById("chains-list")
const historyList = document.getElementById("history-list")

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
    document.getElementById(`${tabId}-chain`).classList.add("active")

    // Load data for the selected tab
    if (tabId === "saved") {
      loadSavedChains()
    } else if (tabId === "history") {
      loadRequestHistory()
    } else if (tabId === "current") {
      loadCurrentChain()
    }
  })
})

// Check recording status on popup open
chrome.runtime.sendMessage({ action: "getRecordingStatus" }, (response) => {
  updateRecordingUI(response.isRecording)
})

// Load current chain on popup open
loadCurrentChain()

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
      loadCurrentChain()
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
      loadCurrentChain()
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

function loadCurrentChain() {
  chrome.runtime.sendMessage({ action: "getCurrentChain" }, (response) => {
    renderRequestList(currentRequests, response.chain)
    saveChainBtn.disabled = response.chain.length === 0
    clearChainBtn.disabled = response.chain.length === 0
  })
}

function loadSavedChains() {
  chrome.runtime.sendMessage({ action: "getSavedChains" }, (response) => {
    renderChainsList(response.chains)
  })
}

function loadRequestHistory() {
  chrome.runtime.sendMessage({ action: "getCurrentChain" }, (response) => {
    renderRequestList(historyList, response.chain)
  })
}

function renderRequestList(container, requests) {
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="empty-state">No requests recorded yet</div>'
    return
  }

  container.innerHTML = ""

  requests.forEach((request) => {
    const requestEl = document.createElement("div")
    requestEl.className = "request-item"

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

    container.appendChild(requestEl)
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

    chainsList.appendChild(chainEl)
  })
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
    loadCurrentChain()
  }
})
