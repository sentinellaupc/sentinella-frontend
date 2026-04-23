"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiFetch, apiJson } from "@/lib/api/http";

type Rule = {
  id: string;
  nodeId: string;
  sensorType: string;
  operator: string;
  thresholdValue: string | number;
  severity: string;
  channels: string[];
  escalationMinutes?: number | null;
  active?: boolean;
};

const OPERATORS = ["GT", "LT", "GTE", "LTE"] as const;
const SEVERITIES = ["INFO", "WARNING", "CRITICAL"] as const;
const CHANNELS = ["APP", "SMS", "EMAIL"] as const;

export default function AlertRulesPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    nodeId: "",
    sensorType: "WATER_LEVEL",
    operator: "GT" as (typeof OPERATORS)[number],
    thresholdValue: "0",
    severity: "WARNING" as (typeof SEVERITIES)[number],
    channels: ["APP"] as string[],
    escalationMinutes: "",
  });

  function load() {
    setError(null);
    apiJson<Rule[]>("alert-rules")
      .then(setRules)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar reglas");
      });
  }

  useEffect(() => {
    load();
  }, []);

  function toggleChannel(ch: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }));
  }

  async function createRule(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (form.channels.length === 0) {
        setError("Selecciona al menos un canal");
        return;
      }
      await apiJson<Rule>("alert-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: form.nodeId.trim(),
          sensorType: form.sensorType.trim(),
          operator: form.operator,
          thresholdValue: Number(form.thresholdValue),
          severity: form.severity,
          channels: form.channels,
          escalationMinutes: form.escalationMinutes ? Number(form.escalationMinutes) : null,
        }),
      });
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  async function removeRule(id: string) {
    if (!confirm("Eliminar regla?")) {
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`alert-rules/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        throw new ApiError(`HTTP ${res.status}`, res.status, t);
      }
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Umbrales" description="CRUD /v1/alert-rules — roles MANAGER/ADMIN." />
      {error ? <p className="text-sm text-amber-400">{error}</p> : null}

      <form onSubmit={(ev) => void createRule(ev)} className="mt-6 max-w-xl space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <p className="font-medium text-slate-200">Nueva regla</p>
        <div>
          <label className="text-xs text-slate-500">nodeId (UUID)</label>
          <input
            required
            value={form.nodeId}
            onChange={(e) => setForm((f) => ({ ...f, nodeId: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Tipo sensor</label>
          <input
            required
            value={form.sensorType}
            onChange={(e) => setForm((f) => ({ ...f, sensorType: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Operador</label>
            <select
              value={form.operator}
              onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value as (typeof OPERATORS)[number] }))}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            >
              {OPERATORS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Umbral</label>
            <input
              required
              type="number"
              step="any"
              value={form.thresholdValue}
              onChange={(e) => setForm((f) => ({ ...f, thresholdValue: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Severidad</label>
          <select
            value={form.severity}
            onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as (typeof SEVERITIES)[number] }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-xs text-slate-500">Canales</span>
          <div className="mt-1 flex gap-3">
            {CHANNELS.map((ch) => (
              <label key={ch} className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={form.channels.includes(ch)} onChange={() => toggleChannel(ch)} />
                {ch}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">Escalación (min, opcional)</label>
          <input
            type="number"
            value={form.escalationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, escalationMinutes: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
        >
          Crear
        </button>
      </form>

      <h2 className="mt-8 text-sm font-semibold text-slate-300">Reglas existentes</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {rules.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
            <span className="text-slate-300">
              {r.sensorType} {r.operator} {String(r.thresholdValue)} → {r.severity}{" "}
              <span className="text-slate-500">({r.nodeId.slice(0, 8)}…)</span>
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => void removeRule(r.id)}
              className="text-xs text-red-400 hover:underline disabled:opacity-50"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
