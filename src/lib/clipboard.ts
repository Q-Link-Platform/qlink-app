/**
 * Robust clipboard utility for Q-Link (Quantum Link).
 * Provides tech-giant standard image & text clipboard operations.
 */

/**
 * Copies an image from a URL (remote URL, relative upload, or data URL) to the system clipboard.
 * Converts to PNG Blob via offscreen canvas to guarantee cross-browser compatibility
 * (Chromium, Safari, Edge, and Firefox Clipboard API strictly require 'image/png' on write).
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  if (typeof window === "undefined" || !imageUrl) return false;

  try {
    // 1. Convert image to clean PNG Blob via offscreen canvas
    const blob = await new Promise<Blob | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((b) => resolve(b), "image/png");
        } catch (e) {
          console.warn("[Clipboard] Canvas conversion error, attempting fetch fallback:", e);
          resolve(null);
        }
      };

      img.onerror = () => {
        // Fallback: try fetching as direct blob
        fetch(imageUrl)
          .then((res) => (res.ok ? res.blob() : null))
          .then((b) => resolve(b))
          .catch(() => resolve(null));
      };

      img.src = imageUrl;
    });

    // 2. Write to system clipboard via ClipboardItem
    if (blob && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      const pngBlob = blob.type === "image/png" ? blob : new Blob([blob], { type: "image/png" });
      const item = new ClipboardItem({ "image/png": pngBlob });
      await navigator.clipboard.write([item]);
      return true;
    }

    // 3. Electron desktop integration fallback
    if ((window as any).electronAPI?.copyImage) {
      await (window as any).electronAPI.copyImage(imageUrl);
      return true;
    }

    // 4. Safe fallback: copy image URL if binary image write is not permitted
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(imageUrl);
      return true;
    }

    return false;
  } catch (err) {
    console.error("[Clipboard] Copy image failed:", err);
    // Ultimate fallback: write URL text
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
        return true;
      }
    } catch {}
    return false;
  }
}
