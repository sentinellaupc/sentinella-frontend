"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";
import { useSessionStore } from "@/stores/useSessionStore";

type Round = {
  id: string;
  operatorId?: string;
  tailingDamId: string;
  scheduledAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  status: string;
  offlineCreated?: boolean;
};

export default function InspectionsPage() {
  const user = useSessionStore((s) => s.user);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tailingDamId, setTailingDamId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

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
    apiJson<Round[]>("rounds")
      .then(setRounds)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar rondas");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function createRound(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const iso = new Date(scheduledAt).toISOString();
      await apiJson<Round>("rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailingDamId: tailingDamId.trim(),
          scheduledAt: iso,
          offlineCreated: false,
        }),
      });
      setScheduledAt("");
      load();
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Rondas de inspeccion" description="GET/POST /v1/rounds — operador autenticado." />
      {error ? <p className="text-sm text-amber-400">{error}</p> : null}

      <form onSubmit={(ev) => void createRound(ev)} className="mt-6 max-w-lg space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <p className="font-medium text-slate-200">Nueva ronda</p>
        <div>
          <label className="text-xs text-slate-500">Tranque (UUID)</label>
          <input
            required
            value={tailingDamId}
            onChange={(e) => setTailingDamId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Programada</label>
          <input
            required
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
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

      <h2 className="mt-8 text-sm font-semibold text-slate-300">Historial</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {rounds.map((r) => (
          <li key={r.id} className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-2">
            <Link href={`/inspections/${r.id}`} className="text-teal-400 hover:underline">
              {r.id.slice(0, 8)}…
            </Link>
            <span className="ml-2 text-slate-500">{r.status}</span>
            <span className="ml-2 text-xs text-slate-600">{r.scheduledAt}</span>
          </li>
        ))}
      </ul>
      {rounds.length === 0 ? <p className="mt-2 text-sm text-slate-500">Sin rondas.</p> : null}
    </div>
  );
}
