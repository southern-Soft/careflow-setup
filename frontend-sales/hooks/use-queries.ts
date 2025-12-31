/**
 * TanStack Query Hooks for Southern IOT
 *
 * Custom hooks that integrate TanStack Query with the existing API services.
 * Uses centralized query keys from query.config.ts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/query.config";
import {
  ordersService,
  usersService,
} from "@/services/api";



// ============================================================================
// ORDERS HOOKS
// ============================================================================

export function useOrders(limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS.LIST().key, limit],
    queryFn: () => ordersService.getAll(limit),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.ORDERS.DETAIL(id).key],
    queryFn: () => ordersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => ordersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      ordersService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.ORDERS.LIST().key],
      });
    },
  });
}

// ============================================================================
// USERS HOOKS (Requires token)
// ============================================================================

export function useUsers(token: string, limit?: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS.LIST().key, limit],
    queryFn: () => usersService.getAll(token, limit),
    enabled: !!token,
  });
}

export function useUser(id: number, token: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS.DETAIL(id).key],
    queryFn: () => usersService.getById(id, token),
    enabled: !!id && !!token,
  });
}

export function useCreateUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof usersService.create>[0]) =>
      usersService.create(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
    },
  });
}

export function useUpdateUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
      usersService.update(id, data, token),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.DETAIL(id).key],
      });
    },
  });
}

export function useDeleteUser(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usersService.delete(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.USERS.LIST().key],
      });
    },
  });
}
