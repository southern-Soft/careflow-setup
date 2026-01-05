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
  END_DEVICE: () => ({ path: "/dashboard/IOT/end_device" as const }),
  GATEWAY: () => ({ path: "/dashboard/IOT/gateway" as const }),
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
    LOGIN: () => ({ root: "/auth_implementation/login" as const }),
    LOGOUT: () => ({ root: "/auth_implementation/logout" as const }),
    REGISTER: () => ({ root: "/auth_implementation/register" as const }),
    ME: () => ({ root: "/auth_implementation/me" as const }),
    FORGOT_PASSWORD: () => ({ root: "/auth_implementation/forgot-password" as const }),
    RESET_PASSWORD: () => ({ root: "/auth_implementation/reset-password" as const }),
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

  // Implementation Users
  USERS_IMPLEMENTATION: {
    LIST: (limit?: number) => ({
      root: `/users_implementation/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number) => ({ root: `/users_implementation/${id}` as const }),
    CREATE: () => ({ root: "/users_implementation" as const }),
    UPDATE: (id: number) => ({ root: `/users_implementation/${id}` as const }),
    DELETE: (id: number) => ({ root: `/users_implementation/${id}` as const }),
  } as const,

  // End Devices
  END_DEVICE: {
    LIST: (limit?: number) => ({
      root: `/end_device/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number | string) => ({ root: `/end_device/${id}` as const }),
    CREATE: () => ({ root: "/end_device" as const }),
    UPDATE: (id: number | string) => ({ root: `/end_device/${id}` as const }),
    DELETE: (id: number | string) => ({ root: `/end_device/${id}` as const }),
  } as const,

  // Gateways
  GATEWAY: {
    LIST: (limit?: number) => ({
      root: `/gateway/?limit=${limit || API_LIMITS.DEFAULT}` as const,
    }),
    DETAIL: (id: number | string) => ({ root: `/gateway/${id}` as const }),
    CREATE: () => ({ root: "/gateway" as const }),
    UPDATE: (id: number | string) => ({ root: `/gateway/${id}` as const }),
    DELETE: (id: number | string) => ({ root: `/gateway/${id}` as const }),
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
