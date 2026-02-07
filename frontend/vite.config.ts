/**
 * Vite Configuration
 * ===================
 * Vite is the build tool and development server for the React frontend.
 * This file configures two main things:
 *
 *   1. Plugins — enables React support (JSX transforms, Fast Refresh).
 *   2. Dev Server Proxy — forwards API requests to the backend.
 *
 * The proxy is the key piece: it solves the "two servers" problem during
 * development. The frontend runs on port 5173, the backend on port 8000.
 * Without a proxy, the browser would block cross-origin requests. With
 * the proxy, the frontend fetches "/api/health" from itself (port 5173),
 * and Vite silently forwards it to the backend (port 8000).
 *
 * Learn more: https://vite.dev/config/
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Register the React plugin. This enables:
  //   - JSX/TSX support (the HTML-like syntax in .tsx files).
  //   - Fast Refresh (instant UI updates when you save a file, without
  //     losing component state — much better than a full page reload).
  plugins: [react()],

  server: {
    // Proxy configuration for the development server.
    // Any request whose path starts with "/api" will be forwarded
    // to the backend at http://localhost:8000.
    //
    // Example: fetch("/api/health")
    //   → Vite intercepts the request
    //   → Forwards it to http://localhost:8000/api/health
    //   → Returns the backend's response to the browser
    //
    // This means your frontend code can use simple relative URLs
    // like "/api/health" instead of "http://localhost:8000/api/health".
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // Where to forward requests
        changeOrigin: true,               // Adjusts the Host header to match the target
      },
    },
  },
})
