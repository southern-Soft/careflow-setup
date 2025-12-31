/**
 * Utility Functions for Southern IOT
 *
 * Common utilities used throughout the application
 * Note: cn() function is in @/lib/utils.ts for shadcn/ui compatibility
 */

import { Metadata } from "next";
import { FRONTEND_CONFIG, APP_CONFIG, ID_CONFIG } from "@/lib/config";

// ============================================================================
// String Utilities
// ============================================================================

/**
 * Generate avatar fallback from name (first letters of each word)
 */
export function generateAvatarFallback(string: string) {
  const names = string.split(" ").filter((name: string) => name);
  const mapped = names.map((name: string) => name.charAt(0).toUpperCase());
  return mapped.join("");
}

/**
 * Get initials from full name (first and last name)
 */
export const getInitials = (fullName: string): string => {
  const nameParts = fullName.trim().split(" ").filter(Boolean);
  if (nameParts.length === 0) return "??";
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  const firstNameInitial = nameParts[0].charAt(0).toUpperCase();
  const lastNameInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  return `${firstNameInitial}${lastNameInitial}`;
};

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(str: string): string {
  if (!str) return "";
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  if (!str) return "";
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/**
 * Slugify a string (convert to URL-friendly format)
 */
export function slugify(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format date for display
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: "short" | "long" | "iso" | "relative" = "short"
): string {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "Invalid Date";

  switch (format) {
    case "long":
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    case "iso":
      return d.toISOString().split("T")[0];
    case "relative":
      return getRelativeTime(d);
    default:
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return formatDate(date, "short");
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "Invalid Date";

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "USD"
): string {
  if (amount === null || amount === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format numbers with thousands separator
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "N/A";
  return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format percentage
 */
export function formatPercent(
  value: number | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============================================================================
// Object Utilities
// ============================================================================

/**
 * Check if value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

// ============================================================================
// Function Utilities
// ============================================================================

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// Error Utilities
// ============================================================================

/**
 * Get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unknown error occurred";
}

// ============================================================================
// URL Utilities
// ============================================================================

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

// ============================================================================
// ID Utilities
// ============================================================================

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Metadata Utilities
// ============================================================================

/**
 * Generate Next.js Metadata object for SEO
 */
export function generateMeta({
  title,
  description,
  canonical,
}: {
  title: string;
  description: string;
  canonical: string;
}): Metadata {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : FRONTEND_CONFIG.BASE_URL;

  return {
    title: `${title} - ${APP_CONFIG.NAME} ${APP_CONFIG.DESCRIPTION}`,
    description: description,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: canonical,
    },
  };
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Remove duplicates from array by key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  order: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// ID Generation Utilities
// ============================================================================

/**
 * Generate sample ID based on buyer code, year, month, and sequence
 */
export async function generateSampleId(
  buyerName: string,
  existingSamples: any[] = []
): Promise<string> {
  const buyerCode = buyerName.substring(0, 3).toUpperCase();
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  // Filter samples with same buyer/year/month
  const matchingSamples = existingSamples.filter(
    (sample: any) =>
      sample.buyer_code === buyerCode &&
      new Date(sample.created_at || sample.date).getFullYear() === year &&
      String(new Date(sample.created_at || sample.date).getMonth() + 1).padStart(2, "0") === month
  );

  const sequence = String(matchingSamples.length + 1).padStart(3, "0");
  return `${buyerCode}_${year}_${month}_${sequence}`;
}

/**
 * Generate style ID based on style name
 */
export async function generateStyleId(styleName: string): Promise<string> {
  const styleCode = styleName
    .substring(0, 6)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const timestamp = Date.now().toString().slice(-6);
  return `${styleCode}_${timestamp}`;
}

/**
 * Generate style variant ID
 * Supports two formats:
 * 1. With piece and size count: (baseStyleId, pieceCount, sizeCount) - for set pieces
 * 2. With color and size: (styleId, color, size) - for color/size variants
 */
export function generateStyleVariantId(
  styleId: string,
  secondParam: string | number,
  thirdParam: string | number
): string {
  // If second param is a number, use piece/size count format
  if (typeof secondParam === "number" && typeof thirdParam === "number") {
    const pieces = secondParam > 0 ? secondParam : 1;
    const sizes = thirdParam > 0 ? thirdParam : 0;
    return `${styleId}_${pieces}_${sizes}`;
  }
  
  // Otherwise use color/size format
  const colorCode = String(secondParam).substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const sizeCode = String(thirdParam).substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${styleId}_${colorCode}_${sizeCode}`;
}

/**
 * Generate PO number (e.g., SCLPO_24_0001)
 * Uses ID_CONFIG.PO_PREFIX for the prefix
 */
export function generateSclPo(existingOrders: any[] = []): string {
  const currentYear = new Date().getFullYear();
  const yearSuffix = currentYear.toString().slice(-2);
  const prefix = ID_CONFIG.PO_PREFIX;

  const currentYearOrders = existingOrders.filter(
    (order: any) =>
      order.scl_po && order.scl_po.startsWith(`${prefix}_${yearSuffix}_`)
  );

  let maxSequence = 0;
  currentYearOrders.forEach((order: any) => {
    const parts = order.scl_po.split("_");
    if (parts.length === 3) {
      const seq = parseInt(parts[2]);
      if (!isNaN(seq) && seq > maxSequence) {
        maxSequence = seq;
      }
    }
  });

  const sequence = maxSequence + 1;
  const sequenceStr = sequence.toString().padStart(4, "0");

  return `${prefix}_${yearSuffix}_${sequenceStr}`;
}

// ============================================================================
// Array/Data Grouping Utilities
// ============================================================================

/**
 * Group array items by a key function
 */
export function groupByKey<T>(
  array: T[],
  keyFn: (item: T) => string
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  array.forEach((item) => {
    const key = keyFn(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  return grouped;
}

/**
 * Group array items by property key
 */
export function groupByProperty<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

// ============================================================================
// Calculation Utilities
// ============================================================================

/**
 * Sum values in array by key
 */
export function sumBy<T>(array: T[], key: keyof T): number {
  return array.reduce((sum, item) => {
    const value = item[key];
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

/**
 * Calculate total from array of objects with numeric property
 */
export function calculateTotal<T>(
  array: T[],
  getValue: (item: T) => number
): number {
  return array.reduce((sum, item) => sum + getValue(item), 0);
}

// ============================================================================
// File Size Utilities (Enhanced)
// ============================================================================

/**
 * Format bytes to human readable string (with decimal precision)
 * Alias for formatFileSize but with decimals parameter
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

// ============================================================================
// Date Formatting (Enhanced - matches component usage)
// ============================================================================

/**
 * Format date and time with fallback (matches component usage pattern)
 */
export function formatDateTimeWithFallback(
  dateString: string | Date | null | undefined,
  fallback: string = "-"
): string {
  if (!dateString) return fallback;
  try {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return fallback;
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return fallback;
  }
}

// ============================================================================
// UOM Conversion (Re-export from uom-units)
// ============================================================================

export { convertUom, getCompatibleUoms } from "@/lib/uom-units";
