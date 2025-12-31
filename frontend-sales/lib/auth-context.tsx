"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { encryptToken, safeDecrypt } from "@/lib/crypto";
import { authService } from "@/services/api";
import { LINKS } from "@/router.config";
import { AUTH_CONFIG } from "@/lib/config";

// ============================================================================
// Types
// ============================================================================

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  department: string;
  designation: string;
  is_active: boolean;
  is_superuser: boolean;
  department_access?: string[]; // Array of department IDs user can access
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

// Cookie name from configuration
const COOKIE_NAME = AUTH_CONFIG.COOKIE_NAME;

// Storage keys for encrypted data
const TOKEN_STORAGE_KEY = AUTH_CONFIG.TOKEN_STORAGE_KEY;
const USER_STORAGE_KEY = AUTH_CONFIG.USER_STORAGE_KEY;

// Legacy storage keys (for migration)
const LEGACY_TOKEN_KEY = AUTH_CONFIG.LEGACY_TOKEN_KEY;
const LEGACY_USER_KEY = AUTH_CONFIG.LEGACY_USER_KEY;

// ============================================================================
// Context
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// Cookie Helpers
// ============================================================================

function setCookie(name: string, value: string, days: number = AUTH_CONFIG.COOKIE_EXPIRY_DAYS) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/`;
}

// ============================================================================
// Auth Provider
// ============================================================================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize authentication on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication from stored credentials
   * Handles both encrypted (new) and legacy (old) storage formats
   */
  const initializeAuth = async () => {
    if (process.env.NODE_ENV === "development") {
      console.log("[AuthProvider] Initializing authentication...");
    }

    try {
      // Try new encrypted storage first
      const encryptedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const encryptedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (encryptedToken && encryptedUser) {
        // Decrypt stored values
        const decryptedToken = await safeDecrypt(encryptedToken);
        const decryptedUser = await safeDecrypt(encryptedUser);

        if (decryptedToken && decryptedUser) {
          const parsedUser = JSON.parse(decryptedUser);
          setToken(decryptedToken);
          setUser(parsedUser);

          // Update cookie with encrypted token for middleware
          setCookie(COOKIE_NAME, encryptedToken);

          if (process.env.NODE_ENV === "development") {
            console.log("[AuthProvider] Loaded encrypted credentials");
          }
        }
      } else {
        // Try legacy storage format for backward compatibility
        const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
        const legacyUser = localStorage.getItem(LEGACY_USER_KEY);

        if (legacyToken && legacyUser) {
          try {
            const parsedUser = JSON.parse(legacyUser);

            // Migrate to encrypted storage
            const newEncryptedToken = await encryptToken(legacyToken);
            const newEncryptedUser = await encryptToken(legacyUser);

            localStorage.setItem(TOKEN_STORAGE_KEY, newEncryptedToken);
            localStorage.setItem(USER_STORAGE_KEY, newEncryptedUser);

            // Remove legacy storage
            localStorage.removeItem(LEGACY_TOKEN_KEY);
            localStorage.removeItem(LEGACY_USER_KEY);

            // Delete old cookie and set new one
            deleteCookie(AUTH_CONFIG.LEGACY_COOKIE_NAME);
            setCookie(COOKIE_NAME, newEncryptedToken);

            setToken(legacyToken);
            setUser(parsedUser);

            if (process.env.NODE_ENV === "development") {
              console.log("[AuthProvider] Migrated legacy credentials to encrypted storage");
            }
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("[AuthProvider] Error migrating legacy credentials:", error);
            }
            // Clear corrupted legacy data
            localStorage.removeItem(LEGACY_TOKEN_KEY);
            localStorage.removeItem(LEGACY_USER_KEY);
            deleteCookie(AUTH_CONFIG.LEGACY_COOKIE_NAME);
          }
        } else {
          // No stored credentials - clear any stale cookies
          const cookieToken = getCookie(COOKIE_NAME);
          const legacyCookieToken = getCookie(AUTH_CONFIG.LEGACY_COOKIE_NAME);
          if (cookieToken) deleteCookie(COOKIE_NAME);
          if (legacyCookieToken) deleteCookie(AUTH_CONFIG.LEGACY_COOKIE_NAME);
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[AuthProvider] Error initializing auth:", error);
      }
      // Clear all stored data on error
      clearAllStoredData();
    }

    setIsLoading(false);
  };

  /**
   * Clear all stored authentication data
   */
  const clearAllStoredData = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    deleteCookie(COOKIE_NAME);
    deleteCookie(AUTH_CONFIG.LEGACY_COOKIE_NAME);
  };

  // Redirect to login if on protected route without user
  useEffect(() => {
    if (!isLoading && !user) {
      // Check if on protected route (dashboard but not login/public pages)
      const isProtectedRoute =
        pathname.startsWith("/dashboard") &&
        !pathname.startsWith("/dashboard/login") &&
        !pathname.startsWith("/dashboard/forgot");

      // Also check new auth routes
      const isPublicRoute =
        pathname === LINKS.LOGIN ||
        pathname === LINKS.REGISTER ||
        pathname === LINKS.FORGOT_PASSWORD ||
        pathname === LINKS.HOME;

      if (isProtectedRoute && !isPublicRoute) {
        router.push(LINKS.LOGIN);
      }
    }
  }, [isLoading, user, pathname, router]);

  /**
   * Login with username and password
   */
  const login = async (username: string, password: string) => {
    try {
      // Use service layer for login
      const data = await authService.login(username, password);

      // Get user info
      const userData = await authService.getMe(data.access_token);

      // Encrypt before storing
      const encryptedTokenValue = await encryptToken(data.access_token);
      const encryptedUserValue = await encryptToken(JSON.stringify(userData));

      // Store in state (plaintext for runtime use)
      setToken(data.access_token);
      setUser(userData);

      // Store encrypted in localStorage
      localStorage.setItem(TOKEN_STORAGE_KEY, encryptedTokenValue);
      localStorage.setItem(USER_STORAGE_KEY, encryptedUserValue);

      // Store encrypted in cookie for middleware
      setCookie(COOKIE_NAME, encryptedTokenValue);

      // Redirect to dashboard
      router.push(LINKS.DASHBOARD().path);
      router.refresh();
    } catch (error: any) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
      throw error;
    }
  };

  /**
   * Logout and clear all credentials
   */
  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear all stored data
    clearAllStoredData();

    // Redirect to login
    router.push(LINKS.LOGIN);
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
