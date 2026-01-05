/**
 * Router Configuration for Southern IOT
 *
 * LINKS - Frontend navigation paths (for Next.js routing)
 * PATHS - Backend API endpoint paths (for API calls)
 */

import { API_LIMITS } from "@/lib/config";

// ============================================================================
// LINKS - Frontend Routes
// ============================================================================

export const LINKS = {
  // Auth Routes (Root Level)
  HOME: "/" as const,
  LOGIN: "/login" as const,
  REGISTER: "/register" as const,
  FORGOT_PASSWORD: "/forgot-password" as const,

  // Dashboard
  DASHBOARD: () => ({
    path: "/dashboard/IOT" as const,
  }),

  USERS: () => ({ path: "/dashboard/IOT/users" as const }),
  CLIENTS: () => ({ path: "/dashboard/IOT/clients" as const }),
  REPORTS: () => ({ path: "/dashboard/IOT/reports" as const }),
  // Orders
  ORDERS: {
    LIST: () => ({ path: "/dashboard/IOT/orders" as const }),
    DETAIL: (orderId: string | number) => ({
      path: `/dashboard/IOT/orders/${orderId}` as const,
    }),
  } as const,
} as const;

// ============================================================================
// PATHS - Backend API Endpoints
// ============================================================================

export const PATHS = {
  // Authentication
  AUTH: {
    LOGIN: () => ({ root: "/auth/login" as const }),
    LOGOUT: () => ({ root: "/auth/logout" as const }),
    REGISTER: () => ({ root: "/auth/register" as const }),
    ME: () => ({ root: "/auth/me" as const }),
    FORGOT_PASSWORD: () => ({ root: "/auth/forgot-password" as const }),
    RESET_PASSWORD: () => ({ root: "/auth/reset-password" as const }),
  } as const,

  // Users
  USERS: {
    LIST: (limit?: number) => ({
      root: `/users/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/users/${id}` as const }),
    CREATE: () => ({ root: "/users" as const }),
    UPDATE: (id: number) => ({ root: `/users/${id}` as const }),
    DELETE: (id: number) => ({ root: `/users/${id}` as const }),
  } as const,

  // Orders
  ORDERS: {
    LIST: (limit?: number) => ({
      root: `/orders/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/orders/${id}` as const }),
    CREATE: () => ({ root: "/orders" as const }),
    UPDATE: (id: number) => ({ root: `/orders/${id}` as const }),
    DELETE: (id: number) => ({ root: `/orders/${id}` as const }),
  } as const,

  // Clients
  CLIENTS: {
    LIST: (limit?: number) => ({
      root: `/clients/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/clients/${id}` as const }),
    CREATE: () => ({ root: "/clients" as const }),
    UPDATE: (id: number) => ({ root: `/clients/${id}` as const }),
    DELETE: (id: number) => ({ root: `/clients/${id}` as const }),
  } as const,

  // Master Data
  MASTER: {
    COLORS: {
      LIST: (category?: string) => ({
        root: `/master/colors/${category ? `?category=${category}&` : "?"}is_active=true` as const,
      }),
      DETAIL: (id: number) => ({ root: `/master/colors/${id}` as const }),
      CREATE: () => ({ root: "/master/colors" as const }),
      UPDATE: (id: number) => ({ root: `/master/colors/${id}` as const }),
      DELETE: (id: number) => ({ root: `/master/colors/${id}` as const }),
      SEED_DEFAULTS: () => ({ root: "/master/seed-defaults" as const }),
    } as const,
  } as const,
  // Reports
  REPORTS: {
    DASHBOARD: () => ({ root: "/reports/dashboard" as const }),
    EXPORT: (type: string) => ({ root: `/reports/export/${type}` as const }),
  } as const,

} as const;

// ============================================================================
// Type Exports
// ============================================================================

export type LinksType = typeof LINKS;
export type PathsType = typeof PATHS;
