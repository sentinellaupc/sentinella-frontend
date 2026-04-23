"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/useSessionStore";
import type { Role } from "@/types/session";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/monitoring", label: "Monitoreo" },
  { href: "/monitoring/map", label: "Mapa de nodos" },
  { href: "/alerts", label: "Alertas" },
  { href: "/alerts/rules", label: "Umbrales" },
  { href: "/inspections", label: "Inspecciones" },
  { href: "/reports", label: "Reportes" },
  { href: "/digital-twin", label: "Gemelo digital" },
  { href: "/simulations", label: "Simulaciones" },
] as const;

const adminNav = [
  { href: "/admin/nodes", label: "Nodos (admin)" },
  { href: "/admin/users", label: "Usuarios" },
] as const;

function canSeeSimulations(role: Role | undefined) {
  return role === "PLANT_MANAGER" || role === "SYSTEM_ADMIN";
}

function canSeeAdmin(role: Role | undefined) {
  return role === "SYSTEM_ADMIN";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useSessionStore((s) => s.user);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    useSessionStore.getState().clear();
    router.replace("/login");
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-teal-900/30 bg-slate-950/90 text-sm text-slate-200">
      <div className="border-b border-teal-900/30 px-4 py-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-teal-400">Sentinella</div>
        <div className="mt-1 truncate text-xs text-slate-400">{user?.fullName ?? "—"}</div>
        <div className="truncate text-[11px] text-slate-500">{user?.role ?? ""}</div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {nav
          .filter((item) => (item.href.startsWith("/simulations") ? canSeeSimulations(user?.role) : true))
          .map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 transition-colors ${
                  active ? "bg-teal-900/50 text-white" : "hover:bg-slate-800/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        {canSeeAdmin(user?.role) &&
          adminNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 transition-colors ${
                  active ? "bg-amber-900/40 text-white" : "hover:bg-slate-800/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
      </nav>
      <div className="border-t border-teal-900/30 p-2">
        <Link href="/mobile" className="block rounded-md px-3 py-2 hover:bg-slate-800/80">
          Vista móvil (PWA)
        </Link>
        <button
          type="button"
          onClick={() => void logout()}
          className="mt-1 w-full rounded-md px-3 py-2 text-left text-red-300 hover:bg-red-950/40"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
