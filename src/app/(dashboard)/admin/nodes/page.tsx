"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";
import { useSessionStore } from "@/stores/useSessionStore";

export default function AdminNodesPage() {
  const user = useSessionStore((s) => s.user);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    externalId: "",
    name: "",
    tailingDamId: "",
    sensorType: "WATER_LEVEL",
    latitude: "",
    longitude: "",
    position3d: "",
  });

  useEffect(() => {
    useSessionStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (user?.tailingDamIds?.length && !form.tailingDamId) {
      setForm((f) => ({ ...f, tailingDamId: user.tailingDamIds![0] }));
    }
  }, [user, form.tailingDamId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const body: Record<string, unknown> = {
        externalId: form.externalId.trim(),
        name: form.name.trim(),
        tailingDamId: form.tailingDamId.trim(),
        sensorType: form.sensorType.trim(),
      };
      if (form.latitude) {
        body.latitude = Number(form.latitude);
      }
      if (form.longitude) {
        body.longitude = Number(form.longitude);
      }
      if (form.position3d.trim()) {
        body.position3d = form.position3d.trim();
      }
      await apiJson("nodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setMessage("Nodo registrado.");
      setForm((f) => ({
        ...f,
        externalId: "",
        name: "",
        latitude: "",
        longitude: "",
        position3d: "",
      }));
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nodos IoT" description="POST /v1/nodes — rol SYSTEM_ADMIN." />
      {user?.role !== "SYSTEM_ADMIN" ? (
        <p className="text-sm text-amber-400">Tu rol no es SYSTEM_ADMIN; el API devolvera 403.</p>
      ) : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-400">{message}</p> : null}

      <form onSubmit={(ev) => void onSubmit(ev)} className="mt-6 max-w-lg space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <div>
          <label className="text-xs text-slate-500">externalId</label>
          <input
            required
            value={form.externalId}
            onChange={(e) => setForm((f) => ({ ...f, externalId: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Nombre</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">tailingDamId (UUID)</label>
          <input
            required
            value={form.tailingDamId}
            onChange={(e) => setForm((f) => ({ ...f, tailingDamId: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">sensorType</label>
          <input
            required
            value={form.sensorType}
            onChange={(e) => setForm((f) => ({ ...f, sensorType: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Latitud</label>
            <input
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Longitud</label>
            <input
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-500">position3d (opcional)</label>
          <input
            value={form.position3d}
            onChange={(e) => setForm((f) => ({ ...f, position3d: e.target.value }))}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-teal-700 px-4 py-2 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}
