/**
 * Fetch and parse JSON (AbortSignal supported).
 */
export async function loadJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const init: RequestInit = {};
  if (signal) init.signal = signal;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Failed to load JSON ${url}: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}
