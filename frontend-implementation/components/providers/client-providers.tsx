"use client";

import React from "react";
import { AuthProvider } from "@/lib/auth-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ErrorSuppressor } from "./error-suppressor";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ErrorSuppressor />
        {children}
        <Toaster position="top-center" richColors />
        <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />
      </AuthProvider>
    </QueryProvider>
  );
}
