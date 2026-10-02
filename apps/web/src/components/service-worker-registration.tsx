"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";

/**
 * Registers the dashboard service worker (/sw.js) and shows a persistent
 * offline notice when the browser loses connectivity. Renders nothing.
 *
 * The SW itself provides the offline fallback: navigations get the last cached
 * copy of the page or /offline.html, and hashed static assets are served
 * cache-first. API traffic (tRPC/server actions) is never intercepted.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    const goOffline = () => {
      toast.error("You're offline — showing cached data", {
        id: "steadystack-offline",
        icon: <WifiOff className="size-4" />,
        duration: Infinity,
      });
    };

    const goOnline = () => {
      toast.dismiss("steadystack-offline");
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    if (!navigator.onLine) goOffline();

    // Register only over secure contexts; skip on localhost http where SWs
    // behave inconsistently behind the dev proxy.
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    }

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return null;
}
