import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Global Error Handler to catch and show runtime crashes on screen!
window.addEventListener('error', (event) => {
  const container = document.getElementById('root')
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; background: #7f1d1d; color: #fef2f2; font-family: monospace; min-height: 100vh;">
        <h1 style="font-size: 20px; margin-bottom: 10px;">⚠️ Runtime JavaScript Error</h1>
        <p style="font-weight: bold; margin-bottom: 5px;">${event.message}</p>
        <p style="font-size: 12px; opacity: 0.8;">Filename: ${event.filename} | Line: ${event.lineno}:${event.colno}</p>
        <pre style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap;">${event.error?.stack || 'No stack trace available'}</pre>
      </div>
    `
  }
})

window.addEventListener('unhandledrejection', (event) => {
  const container = document.getElementById('root')
  if (container) {
    container.innerHTML = `
      <div style="padding: 20px; background: #7f1d1d; color: #fef2f2; font-family: monospace; min-height: 100vh;">
        <h1 style="font-size: 20px; margin-bottom: 10px;">⚠️ Unhandled Promise Rejection</h1>
        <pre style="margin-top: 15px; background: rgba(0,0,0,0.3); padding: 15px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap;">${event.reason}</pre>
      </div>
    `
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
