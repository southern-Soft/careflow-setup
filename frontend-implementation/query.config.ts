/**
 * Query Configuration for Southern IOT
 *
 * Centralized query keys for React Query / TanStack Query
 * Used for caching, invalidation, and data fetching patterns
 */

// ============================================================================
// QUERY_KEYS - Centralized Query Key Registry
// ============================================================================

export const QUERY_KEYS = {
  // Authentication
  USER_DETAIL: (token: string) => ({
    key: `user-detail-${token}` as const,
  }),

  // Users
  USERS: {
    LIST: () => ({ key: "users-list" as const }),
    DETAIL: (id: number) => ({ key: `user-detail-${id}` as const }),
  } as const,

  // Buyers
  BUYERS: {
    LIST: () => ({ key: "buyers-list" as const }),
    DETAIL: (id: number) => ({ key: `buyer-detail-${id}` as const }),
  } as const,

  // Suppliers
  SUPPLIERS: {
    LIST: () => ({ key: "suppliers-list" as const }),
    DETAIL: (id: number) => ({ key: `supplier-detail-${id}` as const }),
  } as const,

  // Contacts
  CONTACTS: {
    LIST: () => ({ key: "contacts-list" as const }),
    DETAIL: (id: number) => ({ key: `contact-detail-${id}` as const }),
  } as const,

  // Shipping
  SHIPPING: {
    LIST: () => ({ key: "shipping-list" as const }),
    DETAIL: (id: number) => ({ key: `shipping-detail-${id}` as const }),
  } as const,

  // Banking
  BANKING: {
    LIST: () => ({ key: "banking-list" as const }),
    DETAIL: (id: number) => ({ key: `banking-detail-${id}` as const }),
  } as const,

  // Samples
  SAMPLES: {
    LIST: () => ({ key: "samples-list" as const }),
    DETAIL: (id: number) => ({ key: `sample-detail-${id}` as const }),
    BY_SAMPLE_ID: (sampleId: string) => ({
      key: `sample-by-id-${sampleId}` as const,
    }),
    OPERATIONS: (sampleId: number) => ({
      key: `sample-operations-${sampleId}` as const,
    }),
  } as const,

  // Styles
  STYLES: {
    LIST: () => ({ key: "styles-list" as const }),
    DETAIL: (id: number) => ({ key: `style-detail-${id}` as const }),
  } as const,

  // Style Variants
  STYLE_VARIANTS: {
    LIST: (styleSummaryId?: number) => ({
      key: styleSummaryId
        ? (`style-variants-${styleSummaryId}` as const)
        : ("style-variants-list" as const),
    }),
    DETAIL: (id: number) => ({ key: `style-variant-detail-${id}` as const }),
  } as const,

  // Materials
  MATERIALS: {
    LIST: () => ({ key: "materials-list" as const }),
    DETAIL: (id: number) => ({ key: `material-detail-${id}` as const }),
    REQUIRED: {
      LIST: (styleVariantId?: number) => ({
        key: styleVariantId
          ? (`required-materials-${styleVariantId}` as const)
          : ("required-materials-list" as const),
      }),
      DETAIL: (id: number) => ({
        key: `required-material-detail-${id}` as const,
      }),
    } as const,
  } as const,

  // Orders
  ORDERS: {
    LIST: () => ({ key: "orders-list" as const }),
    DETAIL: (id: number) => ({ key: `order-detail-${id}` as const }),
  } as const,

  // Production
  PRODUCTION: {
    LIST: () => ({ key: "production-list" as const }),
    DETAIL: (id: number) => ({ key: `production-detail-${id}` as const }),
  } as const,

  // Inventory
  INVENTORY: {
    LIST: () => ({ key: "inventory-list" as const }),
    DETAIL: (id: number) => ({ key: `inventory-detail-${id}` as const }),
  } as const,

  // Master Data
  MASTER: {
    COLORS: {
      LIST: (category?: string) => ({
        key: category ? (`colors-${category}` as const) : ("colors-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `color-detail-${id}` as const }),
    } as const,
    SIZES: {
      LIST: (category?: string) => ({
        key: category ? (`sizes-${category}` as const) : ("sizes-list" as const),
      }),
      DETAIL: (id: number) => ({ key: `size-detail-${id}` as const }),
    } as const,
  } as const,

  // Reports
  REPORTS: {
    DASHBOARD: () => ({ key: "reports-dashboard" as const }),
    EXPORT: (type: string) => ({ key: `reports-export-${type}` as const }),
  } as const,
} as const;

// ============================================================================
// Query Key Helpers
// ============================================================================

/**
 * Invalidate all queries for a specific module
 */
export const getModuleQueryKeys = (module: keyof typeof QUERY_KEYS) => {
  return QUERY_KEYS[module];
};

/**
 * Get all list query keys (for bulk invalidation)
 */
export const getAllListKeys = () => [
  QUERY_KEYS.USERS.LIST().key,
  QUERY_KEYS.BUYERS.LIST().key,
  QUERY_KEYS.SUPPLIERS.LIST().key,
  QUERY_KEYS.CONTACTS.LIST().key,
  QUERY_KEYS.SHIPPING.LIST().key,
  QUERY_KEYS.BANKING.LIST().key,
  QUERY_KEYS.SAMPLES.LIST().key,
  QUERY_KEYS.STYLES.LIST().key,
  QUERY_KEYS.STYLE_VARIANTS.LIST().key,
  QUERY_KEYS.MATERIALS.LIST().key,
  QUERY_KEYS.ORDERS.LIST().key,
  QUERY_KEYS.PRODUCTION.LIST().key,
  QUERY_KEYS.INVENTORY.LIST().key,
];

// ============================================================================
// Type Exports
// ============================================================================

export type QueryKeysType = typeof QUERY_KEYS;
