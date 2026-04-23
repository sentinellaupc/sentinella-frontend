"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";
import { useAlertStore } from "@/stores/useAlertStore";

type AlertRow = { id: string; status: string; severity?: string; nodeId?: string };

export default function AlertsPage() {
  const [rows, setRows] = useState<AlertRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const wsItems = useAlertStore((s) => s.items);

  useEffect(() => {
    apiJson<AlertRow[]>("alerts")
      .then(setRows)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }, []);

  const merged = [...wsItems, ...rows].filter(
    (a, i, arr) => arr.findIndex((x) => x.id === a.id) === i
  );

  return (
    <div>
      <PageHeader title="Alertas" description="Lista desde GET /v1/alerts; actualizaciones vía WebSocket al store." />
      {error ? <p className="text-sm text-amber-400">{error}</p> : null}
      <ul className="mt-4 space-y-2">
        {merged.map((a) => (
          <li key={a.id} className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
            <Link href={`/alerts/${a.id}`} className="text-teal-400 hover:underline">
              {a.id}
            </Link>{" "}
            <span className="text-slate-500">— {a.status}</span>{" "}
            {a.severity ? <span className="text-slate-400">({a.severity})</span> : null}
          </li>
        ))}
      </ul>
      {merged.length === 0 ? <p className="text-sm text-slate-500">Sin alertas.</p> : null}
    </div>
  );
}
