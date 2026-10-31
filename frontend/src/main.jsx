import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      {/* Honour the OS "reduce motion" setting for all Framer Motion animations */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </HashRouter>
  </React.StrictMode>,
)
