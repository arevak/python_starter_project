/**
 * Application Entry Point
 * ========================
 * This is the first JavaScript file that runs when the browser loads the app.
 * Its only job is to mount the React application into the HTML page.
 *
 * The process:
 *   1. The browser loads index.html, which contains a <div id="root"></div>.
 *   2. index.html includes a <script> tag pointing to this file.
 *   3. This file finds the "root" div and tells React to render our App into it.
 *
 * You rarely need to modify this file — it's just the "bootstrap" that
 * connects React to the HTML page.
 */

// StrictMode is a React development tool. It wraps your app and:
//   - Runs components twice in development to catch side effects.
//   - Warns about deprecated API usage.
//   - Helps find common bugs early.
// It has NO effect in production builds — it's purely a development aid.
import { StrictMode } from 'react'

// createRoot is part of React 18+'s rendering API. It creates a "root"
// that React uses to manage a section of the DOM (Document Object Model).
// The older API was ReactDOM.render() — you may see that in older tutorials.
import { createRoot } from 'react-dom/client'

// Import global styles that apply to the entire application (resets, fonts, etc.).
import './index.css'

// Import our main App component — the root of our component tree.
import App from './App.tsx'

// Find the HTML element with id="root" (defined in index.html) and create
// a React root inside it. The `!` (non-null assertion) tells TypeScript
// "I'm sure this element exists" — without it, TypeScript would complain
// that getElementById might return null.
//
// .render() tells React what to display inside that root element.
// Everything inside <StrictMode> gets the extra development checks.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
