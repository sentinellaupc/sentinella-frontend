"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";
import { useSessionStore } from "@/stores/useSessionStore";

const TYPES = [
  "WATER_LEVEL_RISE",
  "HEAVY_RAIN",
  "DIKE_SATURATION",
  "SAFETY_FACTOR",
  "SEEPAGE_DETECTION",
] as const;

export default function NewSimulationPage() {
  const router = useRouter();
  const user = useSessionStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [simulationType, setSimulationType] = useState<(typeof TYPES)[number]>("WATER_LEVEL_RISE");
  const [tailingDamId, setTailingDamId] = useState("");
  const [parametersJson, setParametersJson] = useState('{"deltaMeters": 0.5}');

  useEffect(() => {
    useSessionStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (user?.tailingDamIds?.length && !tailingDamId) {
      setTailingDamId(user.tailingDamIds[0]);
    }
  }, [user, tailingDamId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      let parameters: unknown;
      try {
        parameters = JSON.parse(parametersJson) as unknown;
      } catch {
        setError("JSON de parametros invalido");
        setBusy(false);
        return;
      }
      const created = await apiJson<{ id: string }>("simulation-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          simulationType,
          parameters,
          tailingDamId: tailingDamId.trim(),
        }),
      });
      router.replace(`/simulations/${created.id}`);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al crear");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nuevo escenario" description="POST /v1/simulation-scenarios" />
      <p className="text-sm text-slate-400">
        <Link href="/simulations" className="text-teal-400 hover:underline">
          Volver
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      <form onSubmit={(ev) => void onSubmit(ev)} className="mt-6 max-w-xl space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
        <div>
          <label className="text-xs text-slate-500">Nombre</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Descripcion</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Tipo</label>
          <select
            value={simulationType}
            onChange={(e) => setSimulationType(e.target.value as (typeof TYPES)[number])}
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
          <label className="text-xs text-slate-500">tailingDamId</label>
          <input
            required
            value={tailingDamId}
            onChange={(e) => setTailingDamId(e.target.value)}
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Parametros (JSON)</label>
          <textarea
            value={parametersJson}
            onChange={(e) => setParametersJson(e.target.value)}
            rows={6}
            className="mt-1 w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 px-2 py-1"
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
    </div>
  );
}
