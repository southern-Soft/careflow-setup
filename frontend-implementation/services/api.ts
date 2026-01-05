/**
 * API Service Layer for Southern IOT
 *
 * Core API request function and service modules organized by entity
 */

import { PATHS } from "@/router.config";
import { API_CONFIG } from "@/lib/config";

// ============================================================================
// Configuration
// ============================================================================

// API base path - uses server-side proxy
const getBasePath = () => {
  return API_CONFIG.BASE_PATH;
};

// ============================================================================
// Core API Response Function
// ============================================================================

/**
 * Core API request function following the established pattern
 *
 * @param basePath - Base URL for API requests
 * @param apiPath - Endpoint path (from PATHS config)
 * @param token - Optional authorization token
 * @param method - HTTP method
 * @param body - Request payload (FormData or JSON string)
 * @param addMultipartHeader - Flag for multipart form data
 */
export const getAPIResponse = async (
  basePath: string,
  apiPath: string,
  token: string | null = null,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  body: FormData | string | null = null,
  addMultipartHeader = false
): Promise<any> => {
  try {
    const headers: Record<string, string> = {};

    // Add authorization header if token provided
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Set content type based on body type
    if (body) {
      if (body instanceof FormData) {
        if (addMultipartHeader) {
          // Let browser set Content-Type with boundary for FormData
          // headers["Content-Type"] = "multipart/form-data";
        }
      } else if (typeof body === "string") {
        headers["Content-Type"] = "application/json";
      }
    }

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: body ?? undefined,
    };

    // Construct URL cleanly - avoid double slashes or missing slashes
    const cleanBasePath = basePath.replace(/\/$/, "");
    const cleanApiPath = apiPath.startsWith("/") ? apiPath : `/${apiPath}`;
    const url = `${cleanBasePath}${cleanApiPath}`;

    if (typeof window !== "undefined") {
      console.log(`[API Service] Request: ${method} ${url}`);
    }

    const response = await fetch(url, fetchOptions);

    // Handle non-JSON responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const jsonResponse = await response.json();

      if (!response.ok) {
        throw new Error(jsonResponse.detail || `API Error: ${response.status}`);
      }

      return jsonResponse;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("API Service Error:", error);
    throw error;
  }
};

// ============================================================================
// AUTH SERVICE
// ============================================================================

export const authService = {
  login: async (username: string, password: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.LOGIN().root,
      null,
      "POST",
      JSON.stringify({ username, password })
    );
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    full_name: string;
    role?: string;
    department?: string;
    designation?: string;
  }) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.REGISTER().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  getMe: async (token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.AUTH.ME().root, token, "GET");
  },

  forgotPassword: async (email: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.FORGOT_PASSWORD().root,
      null,
      "POST",
      JSON.stringify({ email })
    );
  },

  resetPassword: async (token: string, newPassword: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.AUTH.RESET_PASSWORD().root,
      null,
      "POST",
      JSON.stringify({ token, new_password: newPassword })
    );
  },
};


// ============================================================================
// COLORS SERVICE
// ============================================================================

export const colorsService = {
  getAll: async (category?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.LIST(category).root,
      null,
      "GET"
    );
  },

  getById: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.DETAIL(id).root,
      null,
      "GET"
    );
  },

  create: async (data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.CREATE().root,
      null,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.UPDATE(id).root,
      null,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.DELETE(id).root,
      null,
      "DELETE"
    );
  },

  seedDefaults: async () => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.MASTER.COLORS.SEED_DEFAULTS().root,
      null,
      "POST"
    );
  },
};

// ============================================================================
// USERS SERVICE
// ============================================================================

export const usersService = {
  getAll: async (token: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS.LIST(limit).root, token, "GET");
  },

  getById: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS.DETAIL(id).root, token, "GET");
  },

  create: async (
    data: {
      username: string;
      email: string;
      password: string;
      full_name: string;
      role?: string;
      department?: string;
      designation?: string;
      is_active?: boolean;
      is_superuser?: boolean;
      department_access?: string[];
    },
    token: string
  ) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// USERS IMPLEMENTATION SERVICE
// ============================================================================

export const usersImplementationService = {
  getAll: async (token: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS_IMPLEMENTATION.LIST(limit).root, token, "GET");
  },

  getById: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.USERS_IMPLEMENTATION.DETAIL(id).root, token, "GET");
  },

  create: async (data: any, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS_IMPLEMENTATION.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: any, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS_IMPLEMENTATION.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number, token: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.USERS_IMPLEMENTATION.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// END DEVICE SERVICE
// ============================================================================

export const endDeviceService = {
  getAll: async (token?: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.END_DEVICE.LIST(limit).root, token, "GET");
  },

  getById: async (id: number | string, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.END_DEVICE.DETAIL(id).root, token, "GET");
  },

  create: async (data: any, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.END_DEVICE.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number | string, data: any, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.END_DEVICE.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number | string, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.END_DEVICE.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// GATEWAY SERVICE
// ============================================================================

export const gatewayService = {
  getAll: async (token?: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.GATEWAY.LIST(limit).root, token, "GET");
  },

  getById: async (id: number | string, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.GATEWAY.DETAIL(id).root, token, "GET");
  },

  create: async (data: any, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.GATEWAY.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number | string, data: any, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.GATEWAY.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number | string, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.GATEWAY.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// CLIENTS SERVICE
// ============================================================================

export const clientsService = {
  getAll: async (token?: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.CLIENTS.LIST(limit).root, token, "GET");
  },

  getById: async (id: number, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.CLIENTS.DETAIL(id).root, token, "GET");
  },

  create: async (data: Record<string, any>, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CLIENTS.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CLIENTS.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.CLIENTS.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};

// ============================================================================
// ORDERS SERVICE
// ============================================================================

export const ordersService = {
  getAll: async (token?: string, limit?: number) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.ORDERS.LIST(limit).root, token, "GET");
  },

  getById: async (id: number, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(basePath, PATHS.ORDERS.DETAIL(id).root, token, "GET");
  },

  create: async (data: Record<string, any>, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.CREATE().root,
      token,
      "POST",
      JSON.stringify(data)
    );
  },

  update: async (id: number, data: Record<string, any>, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.UPDATE(id).root,
      token,
      "PUT",
      JSON.stringify(data)
    );
  },

  delete: async (id: number, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.ORDERS.DELETE(id).root,
      token,
      "DELETE"
    );
  },
};


// ============================================================================
// REPORTS SERVICE
// ============================================================================

export const reportsService = {
  getDashboard: async (token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REPORTS.DASHBOARD().root,
      token,
      "GET"
    );
  },

  export: async (type: string, token?: string) => {
    const basePath = getBasePath();
    return getAPIResponse(
      basePath,
      PATHS.REPORTS.EXPORT(type).root,
      token,
      "GET"
    );
  },
};

// ============================================================================
// BACKWARD COMPATIBILITY - Unified API Export
// ============================================================================

/**
 * Unified API object for backward compatibility
 * Maintains existing import patterns: import { api } from "@/services/api"
 */
export const api = {
  auth: authService,
  users: usersService,
  users_implementation: usersImplementationService,
  end_device: endDeviceService,
  gateway: gatewayService,
  clients: clientsService,
  colors: colorsService,
  orders: ordersService,
  reports: reportsService,
};

// ============================================================================
// Type Exports
// ============================================================================

export type ApiType = typeof api;
