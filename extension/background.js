// ── ScamShield background service worker ─────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Right-click context menu for selected text
  chrome.contextMenus.create({
    id: 'analyzeSelection',
    title: '🛡️ Analyze with ScamShield',
    contexts: ['selection'],
  })

  // Right-click on links
  chrome.contextMenus.create({
    id: 'analyzeLink',
    title: '🛡️ Check this link (ScamShield)',
    contexts: ['link'],
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'analyzeSelection' && info.selectionText) {
    // Store text so popup can pick it up when opened
    chrome.storage.local.set({ pendingAnalysis: info.selectionText })
  }
  if (info.menuItemId === 'analyzeLink' && info.linkUrl) {
    chrome.storage.local.set({ pendingAnalysis: info.linkUrl })
  }
})
