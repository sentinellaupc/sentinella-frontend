"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { useSessionStore } from "@/stores/useSessionStore";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const hydrate = useSessionStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <WebSocketProvider>
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-h-0 flex-1 overflow-y-auto bg-slate-900/40 p-6">{children}</main>
      </div>
    </WebSocketProvider>
  );
}
