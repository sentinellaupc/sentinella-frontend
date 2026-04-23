"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";

type ChecklistItem = {
  id: string;
  pointName: string;
  required?: boolean;
  observations?: string | null;
  completedAt?: string | null;
  anomaly?: boolean;
};

type Round = {
  id: string;
  tailingDamId: string;
  scheduledAt: string;
  status: string;
  checklistItems: ChecklistItem[];
};

export default function InspectionRoundPage() {
  const params = useParams();
  const roundId = typeof params?.roundId === "string" ? params.roundId : "";
  const [round, setRound] = useState<Round | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    if (!roundId) {
      return;
    }
    setError(null);
    apiJson<Round>(`rounds/${roundId}`)
      .then(setRound)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }

  useEffect(() => {
    load();
  }, [roundId]);

  async function completeItem(itemId: string) {
    if (!roundId) {
      return;
    }
    setBusy(true);
    try {
      const updated = await apiJson<Round>(`rounds/${roundId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          observations: "Completado desde web",
          anomaly: false,
        }),
      });
      setRound(updated);
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.body ?? `Error ${e.status}` : "Error al completar");
    } finally {
      setBusy(false);
    }
  }

  async function syncRound() {
    if (!roundId) {
      return;
    }
    setBusy(true);
    try {
      const updated = await apiJson<Round>(`rounds/${roundId}/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setRound(updated);
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.body ?? `Error ${e.status}` : "Error en sync");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title={round ? `Ronda ${round.status}` : `Ronda ${roundId}`} description="Checklist y POST sync." />
      <p className="text-sm text-slate-400">
        <Link href="/inspections" className="text-teal-400 hover:underline">
          Volver
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      {round ? (
        <div className="mt-4 space-y-4 text-sm">
          <p className="text-slate-400">Programada: {round.scheduledAt}</p>
          <button
            type="button"
            disabled={busy}
            onClick={() => void syncRound()}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs hover:bg-slate-700 disabled:opacity-50"
          >
            Sincronizar (POST sync)
          </button>
          <h2 className="font-semibold text-slate-200">Checklist</h2>
          <ul className="space-y-2">
            {(round.checklistItems ?? []).map((it) => (
              <li key={it.id} className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
                <p className="font-medium text-slate-200">{it.pointName}</p>
                {it.completedAt ? (
                  <p className="text-xs text-emerald-400">Completado: {it.completedAt}</p>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void completeItem(it.id)}
                    className="mt-2 rounded bg-teal-800 px-2 py-1 text-xs text-white hover:bg-teal-700 disabled:opacity-50"
                  >
                    Marcar completado
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
