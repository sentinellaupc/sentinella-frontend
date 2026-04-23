"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";

type SensorNode = {
  id: string;
  externalId?: string;
  name: string;
  tailingDamId?: string;
  sensorType?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
  status?: string;
  lastSeen?: string;
};

export default function MonitoringPage() {
  const [nodes, setNodes] = useState<SensorNode[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiJson<SensorNode[]>("nodes")
      .then(setNodes)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar nodos");
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Monitoreo"
        description="Nodos vía GET /v1/nodes; lecturas en tiempo real también por WebSocket."
      />
      <p className="text-sm text-slate-400">
        <Link href="/monitoring/map" className="text-teal-400 hover:underline">
          Mapa georreferenciado
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      <ul className="mt-4 space-y-2">
        {nodes.map((n) => (
          <li key={n.id} className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2 text-sm">
            <Link href={`/monitoring/${n.id}`} className="font-medium text-teal-400 hover:underline">
              {n.name}
            </Link>
            <span className="ml-2 text-slate-500">({n.externalId ?? n.id.slice(0, 8)}…)</span>
            {n.status ? <span className="ml-2 text-slate-400">— {n.status}</span> : null}
            {n.sensorType ? <span className="ml-2 text-slate-500">{String(n.sensorType)}</span> : null}
          </li>
        ))}
      </ul>
      {nodes.length === 0 && !error ? <p className="mt-2 text-sm text-slate-500">Sin nodos.</p> : null}
    </div>
  );
}
