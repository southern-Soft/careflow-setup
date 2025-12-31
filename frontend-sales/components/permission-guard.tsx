"use client";

import { useAuth } from "@/lib/auth-context";
import { canAccessRoute } from "@/lib/permissions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredDepartment?: string;
  requireAdmin?: boolean;
}

export function PermissionGuard({ 
  children, 
  requiredDepartment,
  requireAdmin = false 
}: PermissionGuardProps) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Check admin requirement
    if (requireAdmin && !user?.is_superuser) {
      return; // Will show access denied
    }

    // Check department access
    if (requiredDepartment && !canAccessRoute(user, pathname)) {
      return; // Will show access denied
    }
  }, [user, isLoading, pathname, requiredDepartment, requireAdmin]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && !user?.is_superuser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You need administrator privileges to access this page.
          </p>
        </Card>
      </div>
    );
  }

  // Check department access
  if (requiredDepartment && !canAccessRoute(user, pathname)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this department.
            Please contact your administrator.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

