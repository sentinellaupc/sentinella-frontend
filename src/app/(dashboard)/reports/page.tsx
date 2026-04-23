"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson, withQuery } from "@/lib/api/http";
import { useSessionStore } from "@/stores/useSessionStore";

type Report = {
  id: string;
  type: string;
  format: string;
  tailingDamId?: string | null;
  from: string;
  to: string;
  generatedBy?: string;
  storageKey?: string;
};

type DownloadInfo = { reportId: string; downloadUrl: string };

const TYPES = ["REGULATORY_OEFA", "ALERT_HISTORY", "INSPECTION_SUMMARY"] as const;
const FORMATS = ["PDF", "EXCEL"] as const;

export default function ReportsPage() {
  const user = useSessionStore((s) => s.user);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tailingDamId, setTailingDamId] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]>("ALERT_HISTORY");
  const [format, setFormat] = useState<(typeof FORMATS)[number]>("PDF");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    useSessionStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (user?.tailingDamIds?.length && !tailingDamId) {
      setTailingDamId(user.tailingDamIds[0]);
    }
  }, [user, tailingDamId]);

  function load() {
    setError(null);
    const q = tailingDamId.trim() ? withQuery("reports", { tailingDamId: tailingDamId.trim() }) : "reports";
    apiJson<Report[]>(q)
      .then(setReports)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al listar");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const fromIso = new Date(from).toISOString();
      const toIso = new Date(to).toISOString();
      await apiJson<Report>("reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          from: fromIso,
          to: toIso,
          format,
          tailingDamId: tailingDamId.trim() || null,
        }),
      });
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al generar");
    } finally {
      setBusy(false);
    }
  }

  async function download(reportId: string) {
    setError(null);
    try {
      const info = await apiJson<DownloadInfo>(`reports/${reportId}/download`);
      if (info.downloadUrl) {
        window.open(String(info.downloadUrl), "_blank", "noopener,noreferrer");
      }
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al obtener enlace");
    }
  }

  return (
    <div>
      <PageHeader title="Reportes" description="POST /v1/reports/generate; listado GET; enlace GET .../download." />
      <button
        type="button"
        onClick={() => load()}
        className="mb-4 rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:bg-slate-900"
      >
        Actualizar listado
      </button>
      {error ? <p className="text-sm text-amber-400">{error}</p> : null}

      <form onSubmit={(ev) => void generate(ev)} className="mt-6 max-w-lg space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <p className="font-medium text-slate-200">Generar</p>
        <div>
          <label className="text-xs text-slate-500">Tranque (UUID, opcional)</label>
          <input
            value={tailingDamId}
            onChange={(e) => setTailingDamId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as (typeof TYPES)[number])}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Formato</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as (typeof FORMATS)[number])}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Desde</label>
            <input
              required
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Hasta</label>
            <input
              required
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
        >
          Generar
        </button>
      </form>

      <h2 className="mt-8 text-sm font-semibold text-slate-300">Generados</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {reports.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
            <span className="text-slate-300">
              {r.type} / {r.format} — {r.from?.slice(0, 10)} … {r.to?.slice(0, 10)}
            </span>
            <button
              type="button"
              onClick={() => void download(r.id)}
              className="text-xs text-teal-400 hover:underline"
            >
              Descargar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
