"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";

type Scenario = {
  id: string;
  name: string;
  description?: string | null;
  simulationType: string;
  parameters: Record<string, unknown>;
  tailingDamId: string;
  isPublic?: boolean;
};

const TYPES = [
  "WATER_LEVEL_RISE",
  "HEAVY_RAIN",
  "DIKE_SATURATION",
  "SAFETY_FACTOR",
  "SEEPAGE_DETECTION",
] as const;

export default function SimulationEditPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const [row, setRow] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [simulationType, setSimulationType] = useState<(typeof TYPES)[number]>("WATER_LEVEL_RISE");
  const [parametersJson, setParametersJson] = useState("{}");

  useEffect(() => {
    if (!id) {
      return;
    }
    setError(null);
    apiJson<Scenario>(`simulation-scenarios/${id}`)
      .then((s) => {
        setRow(s);
        setName(s.name);
        setDescription(s.description ?? "");
        setSimulationType(s.simulationType as (typeof TYPES)[number]);
        setParametersJson(JSON.stringify(s.parameters ?? {}, null, 2));
      })
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "Error al cargar");
      });
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!id) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let parameters: unknown;
      try {
        parameters = JSON.parse(parametersJson) as unknown;
      } catch {
        setError("JSON invalido");
        setBusy(false);
        return;
      }
      const updated = await apiJson<Scenario>(`simulation-scenarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          simulationType,
          parameters,
        }),
      });
      setRow(updated);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.body ?? `Error ${err.status}` : "Error al guardar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title={row?.name ?? "Escenario"} description="PUT /v1/simulation-scenarios/{id}" />
      <p className="text-sm text-slate-400">
        <Link href="/simulations" className="text-teal-400 hover:underline">
          Volver
        </Link>
      </p>
      {error ? <p className="mt-2 text-sm text-amber-400">{error}</p> : null}
      {row ? (
        <form onSubmit={(ev) => void save(ev)} className="mt-6 max-w-xl space-y-3 rounded-lg border border-slate-800 p-4 text-sm">
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
            <label className="text-xs text-slate-500">Parametros</label>
            <textarea
              value={parametersJson}
              onChange={(e) => setParametersJson(e.target.value)}
              rows={8}
              className="mt-1 w-full font-mono text-xs rounded border border-slate-700 bg-slate-950 px-2 py-1"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-teal-700 px-4 py-2 text-xs text-white hover:bg-teal-600 disabled:opacity-50"
          >
            Guardar
          </button>
        </form>
      ) : null}
    </div>
  );
}
