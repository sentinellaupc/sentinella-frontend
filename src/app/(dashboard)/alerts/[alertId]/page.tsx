"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";

type AlertDetail = {
  id: string;
  ruleId?: string;
  nodeId: string;
  sensorType?: string;
  triggeredValue?: string | number;
  severity?: string;
  status?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  closedBy?: string;
  closedAt?: string;
  resolutionNotes?: string | null;
};

type AuditRow = {
  id: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  notes?: string | null;
  timestamp: string;
};

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = typeof params?.alertId === "string" ? params.alertId : "";
  const [alert, setAlert] = useState<AlertDetail | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [assignTo, setAssignTo] = useState("");
  const [notes, setNotes] = useState("");

  function reload() {
    if (!alertId) {
      return;
    }
    setError(null);
    Promise.all([
      apiJson<AlertDetail>(`alerts/${alertId}`),
      apiJson<AuditRow[]>(`alerts/${alertId}/audit`),
    ])
      .then(([a, au]) => {
        setAlert(a);
        setAudit(Array.isArray(au) ? au : []);
      })
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }

  useEffect(() => {
    reload();
  }, [alertId]);

  async function patch(action: "ACKNOWLEDGE" | "ASSIGN" | "CLOSE") {
    if (!alertId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { action, notes: notes || undefined };
      if (action === "ASSIGN") {
        if (!assignTo.trim()) {
          setError("Indica UUID de usuario para asignar");
          setBusy(false);
          return;
        }
        body.assignedTo = assignTo.trim();
      }
      const updated = await apiJson<AlertDetail>(`alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setAlert(updated);
      setNotes("");
      const au = await apiJson<AuditRow[]>(`alerts/${alertId}/audit`);
      setAudit(Array.isArray(au) ? au : []);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.body ?? `Error ${e.status}` : "Error al actualizar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={alert ? `Alerta ${alert.severity ?? ""}` : `Alerta ${alertId}`}
        description="GET/PATCH /v1/alerts/{id}; auditoría en /audit."
      />
      <p className="text-sm text-slate-400">
        <Link href="/alerts" className="text-teal-400 hover:underline">
          Volver
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      {alert ? (
        <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-300">
          <p>
            Estado: <span className="text-teal-300">{alert.status}</span> — Nodo:{" "}
            <Link href={`/monitoring/${alert.nodeId}`} className="text-teal-400 hover:underline">
              {alert.nodeId}
            </Link>
          </p>
          <p className="text-slate-400">
            Sensor: {alert.sensorType} — Valor: {String(alert.triggeredValue ?? "—")}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch("ACKNOWLEDGE")}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700 disabled:opacity-50"
            >
              Confirmar (ACK)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch("CLOSE")}
              className="rounded-md bg-teal-900 px-3 py-1.5 text-xs hover:bg-teal-800 disabled:opacity-50"
            >
              Cerrar
            </button>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs text-slate-500">Asignar a (UUID)</label>
              <input
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                className="mt-0.5 w-64 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
              />
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => void patch("ASSIGN")}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700 disabled:opacity-50"
            >
              Asignar
            </button>
          </div>
          <div>
            <label className="block text-xs text-slate-500">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="mt-0.5 w-full max-w-xl rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs"
            />
          </div>
        </div>
      ) : null}
      <h2 className="mt-8 text-sm font-semibold text-slate-300">Auditoría</h2>
      <ul className="mt-2 space-y-1 text-xs text-slate-400">
        {audit.map((row) => (
          <li key={row.id} className="border-b border-slate-800/60 py-1">
            {row.timestamp} — {row.action} ({row.actorRole ?? "?"}) {row.notes ? `— ${row.notes}` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
