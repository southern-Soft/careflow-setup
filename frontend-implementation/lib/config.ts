/**
 * Application Configuration
 *
 * Centralized configuration
 * All configurable values should be defined here and referenced from this file.
 */

// ============================================================================
// App Configuration (Branding & Identity)
// ============================================================================

export const APP_CONFIG = {
  /** Application name - used in titles, headers, etc. */
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "Southern IOT",
  /** Full company name */
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "Southern IOT",
  /** Short company code (used in IDs like SCLPO) */
  COMPANY_CODE: process.env.NEXT_PUBLIC_COMPANY_CODE || "SCL",
  /** Application description */
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "IOT Implementation Framework",
  /** Logo path */
  LOGO_PATH: "/logo.jpeg",
} as const;

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  /**
   * Base path for API requests (masked URL)
   *
   * NOTE:
   * - The Next.js rewrites in `next.config.ts` are configured to mask the backend
   *   behind `/external-api/*` → `${BACKEND_URL}/api/v1/*`
   * - The service layer (`services/api.ts`) should call this base path so that
   *   all requests are properly rewritten to the FastAPI backend.
   * - Client-side code should ONLY use BASE_PATH, never BACKEND_URL
   */
  BASE_PATH: "/api/proxy",
  /** Request timeout in milliseconds */
  TIMEOUT_MS: 30000,
} as const;

/**
 * Server-side only configuration
 * This is used in next.config.ts and API routes, but should NEVER be accessed in client code
 */
export const getServerBackendUrl = () => {
  // Only available server-side
  if (typeof window !== "undefined") {
    throw new Error("BACKEND_URL should never be accessed client-side. Use API_CONFIG.BASE_PATH instead.");
  }

  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    "http://backend:1679"  // Using Docker service name for internal communication
  );
};

// Log configuration in development/browser to help debug connectivity
if (typeof window !== "undefined") {
  console.error("DEBUG: API BASE_PATH IS FORCED TO:", API_CONFIG.BASE_PATH);
}

// ============================================================================
// Frontend URLs
// ============================================================================

export const FRONTEND_CONFIG = {
  /** Base URL for the frontend */
  BASE_URL:
    process.env.NEXT_PUBLIC_BASE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:1678"),
  /** Server port */
  PORT: process.env.PORT || "1678",
} as const;

// ============================================================================
// Authentication Configuration
// ============================================================================

export const AUTH_CONFIG = {
  /** Cookie name for storing auth token */
  COOKIE_NAME: process.env.NEXT_PUBLIC_USER_COOKIE || "sa-iot-user",
  /** Legacy cookie name (for migration) */
  LEGACY_COOKIE_NAME: "auth_token",
  /** Storage key for encrypted token */
  TOKEN_STORAGE_KEY: "encrypted_token",
  /** Storage key for encrypted user data */
  USER_STORAGE_KEY: "encrypted_user",
  /** Legacy storage key for token */
  LEGACY_TOKEN_KEY: "token",
  /** Legacy storage key for user */
  LEGACY_USER_KEY: "user",
  /** Cookie expiry in days */
  COOKIE_EXPIRY_DAYS: 7,
} as const;

// ============================================================================
// API Limits
// ============================================================================

export const API_LIMITS = {
  /** Default limit for list queries */
  DEFAULT: 10000,
  /** Limit for styles queries */
  STYLES: 1000,
  /** Limit for style variants queries */
  STYLE_VARIANTS: 1000,
} as const;

// ============================================================================
// Image Configuration
// ============================================================================

export const IMAGE_CONFIG = {
  /** Allowed hostnames for next/image */
  ALLOWED_HOSTNAMES: process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES?.split(",") || ["localhost"],
  /** Default avatar placeholder URL */
  AVATAR_PLACEHOLDER: process.env.NEXT_PUBLIC_AVATAR_PLACEHOLDER || "/avatars/default.png",
} as const;

// ============================================================================
// ID Generation Configuration
// ============================================================================

export const ID_CONFIG = {
  /** Prefix for PO numbers */
  PO_PREFIX: process.env.NEXT_PUBLIC_PO_PREFIX || `${APP_CONFIG.COMPANY_CODE} PO`,
} as const;

