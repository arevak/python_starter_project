/**
 * API Client Module
 * ==================
 * This module provides a typed wrapper around the browser's built-in `fetch` API.
 * Instead of calling `fetch()` directly in every component, you call `apiFetch()`
 * which handles common concerns:
 *
 *   1. Automatically prepends "/api" to every path, so you write "/health"
 *      instead of "/api/health".
 *   2. Sets the Content-Type header to JSON by default.
 *   3. Throws a descriptive error if the server returns a non-2xx status code.
 *   4. Parses the JSON response and returns it with the correct TypeScript type.
 *
 * Usage example:
 *   interface User { name: string; email: string; }
 *   const user = await apiFetch<User>('/users/1');
 *   // `user` is typed as User — TypeScript knows it has .name and .email
 *
 * NOTE: This helper calls response.json(), so it only works for JSON responses.
 * For streaming responses (like the chat endpoint), use the raw fetch() API
 * directly — see the TUTORIAL for details.
 */

/**
 * Makes a typed API request to the backend.
 *
 * @template T - The expected shape of the JSON response. This is a TypeScript
 *               "generic" — it lets you specify what type the returned data
 *               should be, so you get autocomplete and type checking.
 *
 * @param path    - The API endpoint path WITHOUT the "/api" prefix.
 *                  Example: "/health" will request "/api/health".
 * @param options - Optional fetch configuration (method, body, headers, etc.).
 *                  These are the same options you'd pass to the native fetch().
 *                  Any headers you provide are merged with the default JSON header.
 *
 * @returns A Promise that resolves to the parsed JSON response, typed as T.
 *
 * @throws Error if the server returns a non-2xx HTTP status code.
 *         The error message includes the status code and status text
 *         (e.g., "API error: 404 Not Found").
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  // Build the full URL by prepending "/api" to the given path.
  // In development, Vite's proxy (configured in vite.config.ts) forwards
  // any request starting with "/api" to the backend at localhost:8000.
  const response = await fetch(`/api${path}`, {
    headers: {
      // Set the default Content-Type to JSON. This tells the backend that
      // the request body (if any) is JSON-formatted.
      'Content-Type': 'application/json',
      // Spread any additional headers from the caller. The `?.` (optional
      // chaining) handles the case where options or options.headers is undefined.
      ...options?.headers,
    },
    // Spread the rest of the options (method, body, etc.).
    ...options,
  });

  // Check if the response status code indicates an error (anything outside 200-299).
  // `response.ok` is a built-in property that's true for 2xx status codes.
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Parse the response body as JSON and cast it to the expected type T.
  // `as Promise<T>` tells TypeScript to treat the result as type T.
  // Note: this is a type assertion — TypeScript trusts you that the server
  // actually returns data matching type T. It doesn't validate at runtime.
  return response.json() as Promise<T>;
}
