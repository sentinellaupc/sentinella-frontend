"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";

type SensorNode = {
  id: string;
  name: string;
  externalId?: string;
  sensorType?: string;
  status?: string;
  lastSeen?: string;
  latitude?: string | number | null;
  longitude?: string | number | null;
};

type Reading = {
  id: string;
  nodeId: string;
  timestamp: string;
  sensorType?: string;
  value?: string | number;
  unit?: string;
  status?: string;
};

export default function MonitoringNodeDetailPage() {
  const params = useParams();
  const nodeId = typeof params?.nodeId === "string" ? params.nodeId : "";
  const [node, setNode] = useState<SensorNode | null>(null);
  const [status, setStatus] = useState<Reading | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nodeId) {
      return;
    }
    setError(null);
    Promise.all([
      apiJson<SensorNode>(`nodes/${nodeId}`).catch(() => null),
      apiJson<Reading>(`nodes/${nodeId}/status`).catch(() => null),
      apiJson<Reading[]>(`nodes/${nodeId}/readings?limit=30`).catch(() => []),
    ])
      .then(([n, st, r]) => {
        setNode(n);
        setStatus(st);
        setReadings(Array.isArray(r) ? r : []);
      })
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }, [nodeId]);

  return (
    <div>
      <PageHeader
        title={node?.name ?? `Nodo ${nodeId}`}
        description="GET /v1/nodes/{id}, último estado y lecturas recientes."
      />
      <p className="text-sm text-slate-400">
        <Link href="/monitoring" className="text-teal-400 hover:underline">
          Volver al listado
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      {status ? (
        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm">
          <p className="font-medium text-slate-200">Última lectura</p>
          <p className="mt-1 text-slate-400">
            {status.sensorType}: {String(status.value)} {status.unit ?? ""}{" "}
            <span className="text-slate-500">({status.status})</span>
          </p>
          <p className="text-xs text-slate-500">{status.timestamp}</p>
        </div>
      ) : node ? (
        <p className="mt-4 text-sm text-slate-500">Sin lecturas recientes para este nodo.</p>
      ) : null}
      <h2 className="mt-6 text-sm font-semibold text-slate-300">Historial (30)</h2>
      <ul className="mt-2 max-h-80 space-y-1 overflow-y-auto text-xs text-slate-400">
        {readings.map((r) => (
          <li key={r.id} className="border-b border-slate-800/80 py-1">
            {r.timestamp} — {String(r.sensorType)}: {String(r.value)} {r.unit ?? ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
