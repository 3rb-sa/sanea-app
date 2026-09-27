"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { BottomNav } from "./bottom-nav";

const NAV_ROUTES = new Set(["/", "/post", "/account"]);
// "/" is public so anyone can browse active trips before signing up --
// contacting a driver still requires login (see the trips store).
const PUBLIC_ROUTES = new Set(["/", "/login", "/privacy", "/terms", "/delete-account"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, session, profile } = useAuth();
  const showNav = NAV_ROUTES.has(pathname);
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const needsAuth = !isPublicRoute && !loading && (!session || !profile);

  useEffect(() => {
    if (needsAuth) {
      if (typeof window !== "undefined" && sessionStorage.getItem("accountDeleted")) {
        sessionStorage.removeItem("accountDeleted");
        router.replace("/?accountDeleted=1");
        return;
      }
      const fullPath = pathname + window.location.search;
      router.replace(`/login?next=${encodeURIComponent(fullPath)}`);
    }
  }, [needsAuth, pathname, router]);

  if (loading || needsAuth) {
    return (
      <div className="flex h-dvh items-center justify-center bg-bg pt-[env(safe-area-inset-top)]">
        <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-accent-soft border-t-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[440px] flex-col overflow-hidden bg-bg pt-[env(safe-area-inset-top)]">
      <div
        className="flex flex-1 flex-col overflow-hidden"
        style={showNav ? { paddingBottom: "calc(6rem + env(safe-area-inset-bottom))" } : undefined}
      >
        {children}
      </div>
      {showNav && <BottomNav pathname={pathname} />}
    </div>
  );
}
