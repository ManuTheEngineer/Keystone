"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { KeystoneIcon } from "@/components/icons/KeystoneIcon";

// Routes that should be accessible without authentication
const PUBLIC_ROUTES = ["/learn"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      // Preserve intended destination so login/register can redirect back
      const redirect = pathname && pathname !== "/dashboard" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirect}`);
    }
  }, [user, loading, router, pathname, isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <KeystoneIcon size={48} className="text-sand mx-auto mb-3 animate-pulse" />
          <p className="text-[13px] text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
