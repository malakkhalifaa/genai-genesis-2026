// ── Config ────────────────────────────────────────────────────────────────────
const DEFAULT_API = 'http://localhost:3000'
let apiBase = DEFAULT_API

// ── Personas — match the app's mock data exactly ─────────────────────────────
const PERSONAS = {
  margaret: {
    name: 'Margaret, 72',
    role: 'Retired Teacher',
    avatar: '👵',
    userContext: {
      neverUsedCrypto: true,
      neverSentGiftCards: true,
      typicalContacts: ['family', 'church group', 'Amazon', 'TD Bank'],
      knownDomains: ['amazon.com', 'td.com', 'canada.ca'],
    },
  },
  ahmed: {
    name: 'Ahmed, 24',
    role: 'Graduate Student',
    avatar: '👨‍🎓',
    userContext: {
      neverUsedCrypto: false,
      neverSentGiftCards: true,
      typicalContacts: ['university', 'landlord', 'classmates'],
      knownDomains: ['indeed.com', 'linkedin.com'],
    },
  },
  none: {
    name: 'No Profile',
    role: 'Anonymous',
    avatar: '🔒',
    userContext: null,
  },
}

const PERSONA_KEYS = Object.keys(PERSONAS)
let currentPersona = 'margaret'

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const stored = await chrome.storage.local.get(['apiUrl', 'persona', 'pendingAnalysis'])
  apiBase = stored.apiUrl || DEFAULT_API
  currentPersona = stored.persona || 'margaret'

  document.getElementById('apiUrl').value = apiBase
  renderPersona()
  checkConnection()

  // Wire up buttons
  document.getElementById('saveApiUrl').addEventListener('click', saveApiUrl)
  document.getElementById('analyzePage').addEventListener('click', analyzeCurrentPage)
  document.getElementById('analyzeSelection').addEventListener('click', analyzeSelectedText)
  document.getElementById('analyzeManual').addEventListener('click', analyzeManualText)
  document.getElementById('switchPersona').addEventListener('click', cyclePersona)
  document.getElementById('openDashboard').addEventListener('click', openDashboard)
  document.getElementById('clearResults').addEventListener('click', clearResults)

  // If background stored a pending right-click selection, pre-fill it
  if (stored.pendingAnalysis) {
    document.getElementById('manualInput').value = stored.pendingAnalysis
    await chrome.storage.local.remove('pendingAnalysis')
  }
})

// ── Persona ───────────────────────────────────────────────────────────────────
function renderPersona() {
  const p = PERSONAS[currentPersona]
  document.getElementById('personaAvatar').textContent = p.avatar
  document.getElementById('personaName').textContent = p.name
  document.getElementById('personaRole').textContent = p.role
}

async function cyclePersona() {
  const idx = PERSONA_KEYS.indexOf(currentPersona)
  currentPersona = PERSONA_KEYS[(idx + 1) % PERSONA_KEYS.length]
  await chrome.storage.local.set({ persona: currentPersona })
  renderPersona()
}

// ── API URL ───────────────────────────────────────────────────────────────────
async function saveApiUrl() {
  const val = document.getElementById('apiUrl').value.trim()
  apiBase = val || DEFAULT_API
  await chrome.storage.local.set({ apiUrl: apiBase })
  checkConnection()
}

async function checkConnection() {
  const dot   = document.getElementById('connDot')
  const label = document.getElementById('connLabel')
  try {
    const r = await fetch(`${apiBase}/api/health`, { method: 'GET', mode: 'cors' })
    if (r.ok) {
      dot.className = 'conn-dot online'
      label.textContent = 'Connected'
    } else throw new Error()
  } catch {
    dot.className = 'conn-dot offline'
    label.textContent = 'Offline'
  }
}

// ── Analysis calls ────────────────────────────────────────────────────────────
async function analyzeCurrentPage() {
  showLoading()
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const result = await callAnalyzeAPI({ contentType: 'url', url: tab.url })
    displayResults(result)
  } catch (e) {
    showError(e.message || 'Failed to analyze page. Is your backend running?')
  }
}

async function analyzeSelectedText() {
  showLoading()
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const [{ result: sel }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString().trim(),
    })
    if (!sel) { showError('No text selected. Highlight text on the page first.'); return }
    const result = await callAnalyzeAPI({ contentType: 'text', text: sel })
    displayResults(result)
  } catch (e) {
    showError(e.message || 'Failed to analyze selection.')
  }
}

async function analyzeManualText() {
  const text = document.getElementById('manualInput').value.trim()
  if (!text) { showError('Please paste something to analyze.'); return }
  showLoading()
  try {
    // Detect if it looks like a URL
    const isUrl = /^https?:\/\//i.test(text)
    const body = isUrl
      ? { contentType: 'url', url: text }
      : { contentType: 'text', text }
    const result = await callAnalyzeAPI(body)
    displayResults(result)
  } catch (e) {
    showError(e.message || 'Failed to analyze text.')
  }
}

async function callAnalyzeAPI(body) {
  const persona = PERSONAS[currentPersona]
  const response = await fetch(`${apiBase}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, userContext: persona.userContext }),
    mode: 'cors',
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error || `Server error ${response.status}`)
  }
  return response.json()
}

// ── Display ───────────────────────────────────────────────────────────────────
function displayResults(data) {
  hideLoading()
  const resultsDiv = document.getElementById('results')
  resultsDiv.classList.remove('hidden')

  // Header colours
  const level = (data.riskLevel || 'medium').toLowerCase()
  const header = document.getElementById('riskHeader')
  header.className = `risk-header ${level}`

  const levelLabel = { low: 'Low Risk', medium: 'Medium Risk', high: 'High Risk', critical: 'Critical Risk' }
  const subLabel    = { low: 'Looks safe', medium: 'Be cautious', high: 'Scam detected', critical: 'Scam detected' }
  document.getElementById('riskLabel').textContent   = levelLabel[level] || data.riskLevel
  document.getElementById('riskSublabel').textContent = subLabel[level] || ''
  document.getElementById('riskScore').textContent    = data.riskScore ?? '--'

  // Explanation
  document.getElementById('explanation').textContent = data.explanation || ''

  // Reason tags
  const reasonsDiv = document.getElementById('reasons')
  reasonsDiv.className = `reasons ${level}`
  const tags = Array.isArray(data.reasons) ? data.reasons : []
  reasonsDiv.innerHTML = tags.length
    ? tags.map(r => `<span class="reason-tag">${escHtml(r)}</span>`).join('')
    : '<span style="color:#555;font-size:12px">No specific indicators flagged</span>'

  // Action
  document.getElementById('actionBox').innerHTML = `
    <strong>What to do</strong>
    <p>${escHtml(data.recommendedAction || 'Be cautious and verify through official channels.')}</p>
  `
}

function clearResults() {
  document.getElementById('results').classList.add('hidden')
  document.getElementById('manualInput').value = ''
}

// ── UI helpers ────────────────────────────────────────────────────────────────
function showLoading() {
  document.getElementById('results').classList.add('hidden')
  document.getElementById('loading').classList.remove('hidden')
}

function hideLoading() {
  document.getElementById('loading').classList.add('hidden')
}

function showError(msg) {
  hideLoading()
  const r = document.getElementById('results')
  r.classList.remove('hidden')
  r.innerHTML = `
    <div style="padding:20px;text-align:center;color:#888;">
      <div style="font-size:24px;margin-bottom:8px">⚠️</div>
      <div style="font-size:13px;line-height:1.5">${escHtml(msg)}</div>
      <button onclick="document.getElementById('results').classList.add('hidden')"
        style="margin-top:12px;padding:6px 14px;background:#1a1a1a;border:1px solid rgba(255,255,255,0.1);
               color:#888;border-radius:6px;cursor:pointer;font-size:12px;">Dismiss</button>
    </div>
  `
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function openDashboard() {
  chrome.tabs.create({ url: `${apiBase}/dashboard/analysis?persona=${currentPersona}` })
}
