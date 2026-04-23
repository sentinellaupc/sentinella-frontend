"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiFetch, apiJson } from "@/lib/api/http";

type Scenario = {
  id: string;
  name: string;
  description?: string | null;
  simulationType: string;
  tailingDamId: string;
  isPublic?: boolean;
  /** Jackson puede serializar `boolean isPublic` como clave `public` en JSON. */
  public?: boolean;
  createdAt?: string;
};

function scenarioIsPublic(s: Scenario): boolean {
  return Boolean(s.isPublic ?? s.public);
}

export default function SimulationsListPage() {
  const [list, setList] = useState<Scenario[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setError(null);
    apiJson<Scenario[]>("simulation-scenarios")
      .then(setList)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function publish(id: string, pub: boolean) {
    setBusy(true);
    try {
      await apiJson(`simulation-scenarios/${id}/${pub ? "publish" : "unpublish"}`, { method: "PATCH" });
      load();
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.body ?? `Error ${e.status}` : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Eliminar escenario?")) {
      return;
    }
    setBusy(true);
    try {
      const res = await apiFetch(`simulation-scenarios/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const t = await res.text();
        throw new ApiError(`HTTP ${res.status}`, res.status, t);
      }
      load();
    } catch (e: unknown) {
      setError(e instanceof ApiError ? e.body ?? `Error ${e.status}` : "Error al eliminar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Escenarios de simulacion"
        description="GET /v1/simulation-scenarios; publicar o editar por id."
      />
      <Link
        href="/simulations/new"
        className="inline-block rounded-md bg-teal-700 px-4 py-2 text-sm text-white hover:bg-teal-600"
      >
        Nuevo escenario
      </Link>
      {error ? <p className="mt-4 text-sm text-amber-400">{error}</p> : null}
      <ul className="mt-6 space-y-2 text-sm">
        {list.map((s) => (
          <li key={s.id} className="rounded-md border border-slate-800 bg-slate-950/40 px-3 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <Link href={`/simulations/${s.id}`} className="font-medium text-teal-400 hover:underline">
                  {s.name}
                </Link>
                <p className="text-xs text-slate-500">
                  {s.simulationType} — {scenarioIsPublic(s) ? "publico" : "privado"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {scenarioIsPublic(s) ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void publish(s.id, false)}
                    className="text-xs text-slate-400 hover:underline disabled:opacity-50"
                  >
                    Despublicar
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void publish(s.id, true)}
                    className="text-xs text-teal-400 hover:underline disabled:opacity-50"
                  >
                    Publicar
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void remove(s.id)}
                  className="text-xs text-red-400 hover:underline disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && !error ? <p className="mt-4 text-sm text-slate-500">Sin escenarios.</p> : null}
    </div>
  );
}
