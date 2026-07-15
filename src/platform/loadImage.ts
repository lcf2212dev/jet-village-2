/**
 * Load an image from a URL (AbortSignal last-request-wins friendly).
 */
export function loadImage(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const img = new Image();
    const onAbort = (): void => {
      img.src = '';
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });

    img.onload = (): void => {
      signal?.removeEventListener('abort', onAbort);
      resolve(img);
    };
    img.onerror = (): void => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error(`Failed to load image: ${url}`));
    };
    img.src = url;
  });
}
