import { useEffect, useState } from 'react';
import { apiFetch } from './api/client';
import './App.css';

interface HealthResponse {
  status: string;
  version: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<HealthResponse>('/health')
      .then(setHealth)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="app">
      <h1>React + FastAPI</h1>
      {error && <p className="error">Error: {error}</p>}
      {!health && !error && <p className="loading">Loading...</p>}
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

export default App;
