"use client";

import { useEffect } from "react";

/**
 * Suppresses Next.js development error overlay and console in production
 * This component prevents the "N" error indicator from showing
 */
export function ErrorSuppressor() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Suppress console in production
      if (process.env.NODE_ENV === "production") {
        // Store original methods (for potential error tracking service)
        const originalConsole = {
          log: console.log,
          error: console.error,
          warn: console.warn,
          debug: console.debug,
          info: console.info,
        };

        // Override console methods to be no-ops in production
        console.log = () => {};
        console.error = () => {};
        console.warn = () => {};
        console.debug = () => {};
        console.info = () => {};

        // Optional: You can integrate with error tracking services here
        // Example: Sentry.captureException(error)
      }

      // Remove Next.js error overlay elements
      const removeOverlay = () => {
        // Remove build watcher overlay
        const buildWatcher = document.getElementById("__next-build-watcher");
        if (buildWatcher) {
          buildWatcher.remove();
        }

        // Remove any error overlay iframes
        const errorOverlays = document.querySelectorAll('iframe[src*="__next"]');
        errorOverlays.forEach((overlay) => overlay.remove());

        // Remove error overlay container
        const errorContainer = document.querySelector('[data-nextjs-dialog-overlay]');
        if (errorContainer) {
          errorContainer.remove();
        }
      };

      // Remove immediately
      removeOverlay();

      // Also watch for new overlays being added
      const observer = new MutationObserver(removeOverlay);
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => {
        observer.disconnect();
      };
    }
  }, []);

  return null;
}

