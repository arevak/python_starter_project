/**
 * App Component — Main Application UI
 * =====================================
 * This is the root React component that renders the entire application.
 * Currently, it displays a simple health check status by fetching data
 * from the backend API when the component first loads ("mounts").
 *
 * Key React concepts demonstrated here:
 *   - useState:  Managing component state (data that changes over time).
 *   - useEffect: Running side effects (like API calls) when the component mounts.
 *   - Conditional rendering: Showing different UI based on the current state.
 *   - TypeScript interfaces: Defining the shape of data for type safety.
 */

// Import React hooks. Hooks are special functions that let you "hook into"
// React features like state and lifecycle events from function components.
//   - useEffect: runs a function after the component renders (used for API calls).
//   - useState:  declares a piece of state and a function to update it.
import { useEffect, useState } from 'react';

// Import our typed API client helper (see api/client.ts for details).
import { apiFetch } from './api/client';

// Import component-specific styles. In Vite + React, importing a CSS file
// like this automatically includes those styles in the page.
import './App.css';

/**
 * TypeScript interface defining the shape of the /api/health response.
 *
 * Interfaces describe the structure of an object — what properties it has
 * and what types those properties are. This helps catch bugs at compile time:
 * if you try to access `health.foo`, TypeScript will warn you that `foo`
 * doesn't exist on HealthResponse.
 */
interface HealthResponse {
  status: string;   // Will be "ok" if the backend is running
  version: string;  // The backend's version number (e.g., "0.1.0")
}

/**
 * The main App component.
 *
 * React components are functions that return JSX (HTML-like syntax).
 * When state changes (via setHealth or setError), React automatically
 * re-renders this component with the new data.
 */
function App() {
  // useState<HealthResponse | null>(null) creates a state variable called `health`.
  //   - `health` holds the current value (starts as `null` because we haven't
  //     fetched data yet).
  //   - `setHealth` is a function to update the value. Calling it triggers a re-render.
  //   - The generic <HealthResponse | null> tells TypeScript this state can be
  //     either a HealthResponse object or null.
  const [health, setHealth] = useState<HealthResponse | null>(null);

  // A separate state variable to hold any error message.
  // We keep errors in state so they survive re-renders and display to the user.
  const [error, setError] = useState<string | null>(null);

  // useEffect runs the given function after the component renders.
  // The empty array [] as the second argument means "run this only once,
  // when the component first mounts" (not on every re-render).
  //
  // This is the standard React pattern for loading data when a page loads:
  //   1. Component renders with initial state (null / loading).
  //   2. useEffect fires and starts the API call.
  //   3. When the API responds, setHealth updates the state.
  //   4. React re-renders the component with the new data.
  useEffect(() => {
    // Call our typed API helper to fetch the health check endpoint.
    // apiFetch<HealthResponse> tells TypeScript the response will be
    // a HealthResponse object, so `setHealth` receives the right type.
    apiFetch<HealthResponse>('/health')
      .then(setHealth)             // On success: store the response in state
      .catch((err) => setError(err.message));  // On failure: store the error message
  }, []);

  // The return statement contains JSX — a syntax that looks like HTML but
  // compiles to JavaScript function calls. React uses JSX to describe what
  // the UI should look like.
  return (
    <div className="app">
      <h1>React + FastAPI</h1>

      {/* Conditional rendering: only show the error paragraph if `error` is truthy.
          The && operator short-circuits — if `error` is null, React skips the <p>. */}
      {error && <p className="error">Error: {error}</p>}

      {/* Show a loading indicator while we wait for the API response.
          This renders when health is null AND there's no error. */}
      {!health && !error && <p className="loading">Loading...</p>}

      {/* Once data has loaded, display the health status and version.
          The curly braces {} inside JSX let you embed JavaScript expressions. */}
      {health && (
        <div className="health">
          <p>
            Status: <span className="status">{health.status}</span>
          </p>
          <p>
            Version: <span className="version">{health.version}</span>
          </p>
        </div>
      )}
    </div>
  );
}

// Export the App component as the default export of this module.
// This allows main.tsx to import it with: import App from './App.tsx'
export default App;
