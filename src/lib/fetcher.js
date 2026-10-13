/**
 * Custom FetchError class carrying HTTP status code and response payload.
 */
export class FetchError extends Error {
  constructor(message, status, info = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.info = info;
    this.fieldErrors = info?.fieldErrors || null;
  }
}

/**
 * Shared SWR fetcher with robust HTTP error handling.
 *
 * Conforms to SWR error handling guidelines:
 * - Checks `res.ok` (200-299 status code).
 * - On error, attempts to parse JSON error details (such as `{ success: false, error, details, fieldErrors }`),
 *   falling back to plain text or status text.
 * - Throws a `FetchError` with `.status`, `.info`, and `.fieldErrors` attached.
 * - Handles 204 No Content responses safely.
 * - Supports both `fetcher(url, init)` and SWR array keys `fetcher([url, init])`.
 *
 * @param {string | Request | [string, RequestInit]} resource
 * @param {RequestInit} [init]
 * @returns {Promise<any>}
 */
export async function fetcher(resource, init) {
  let url = resource;
  let options = init;

  // Handle SWR array keys, e.g. useSWR(['/api/orders', { headers }], fetcher)
  if (Array.isArray(resource)) {
    [url, options] = resource;
  }

  const response = await fetch(url, options);

  // If the status code is outside 200-299, throw a FetchError
  if (!response.ok) {
    let errorInfo = null;
    const contentType = response.headers.get("content-type") || "";

    try {
      if (contentType.includes("application/json")) {
        errorInfo = await response.json();
      } else {
        const text = await response.text();
        errorInfo = text ? { message: text } : null;
      }
    } catch {
      errorInfo = null;
    }

    // Determine the most meaningful error message
    const errorMessage =
      errorInfo?.error ||
      errorInfo?.message ||
      errorInfo?.details ||
      `Request failed with status ${response.status} (${response.statusText || "Error"})`;

    throw new FetchError(errorMessage, response.status, errorInfo);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Parse JSON response or fallback to text
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return await response.json();
  }

  return await response.text();
}

export default fetcher;
