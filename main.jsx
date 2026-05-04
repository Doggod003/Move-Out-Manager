import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './styles/index.css'

// Using HashRouter (instead of BrowserRouter) so URLs like /#/app work on
// GitHub Pages without 404s. If you later move to Vercel/Netlify, you can
// switch this back to BrowserRouter for cleaner URLs.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
