"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TWIN_SIMULATIONS } from "@/components/DigitalTwin/simulations";
import { ApiError, apiJson } from "@/lib/api/http";
import { useSimulationStore } from "@/stores/useSimulationStore";

const TwinCanvas = dynamic(() => import("@/components/DigitalTwin/TwinCanvas"), {
  ssr: false,
  loading: () => <p className="text-sm text-slate-500">Cargando gemelo digital (Three.js)…</p>,
});

type TwinNode = {
  id: string;
  externalId?: string;
  name: string;
  sensorType?: string;
  status?: string;
};

export default function DigitalTwinPage() {
  const [nodes, setNodes] = useState<TwinNode[]>([]);
  const [selected, setSelected] = useState<{
    nodeId: string;
    name: string;
    status: string;
    value?: number;
    unit?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mode = useSimulationStore((s) => s.mode);
  const simulationType = useSimulationStore((s) => s.simulationType);
  const params = useSimulationStore((s) => s.params);
  const running = useSimulationStore((s) => s.running);
  const setMode = useSimulationStore((s) => s.setMode);
  const setSimulationType = useSimulationStore((s) => s.setSimulationType);
  const setParam = useSimulationStore((s) => s.setParam);
  const run = useSimulationStore((s) => s.run);
  const stop = useSimulationStore((s) => s.stop);

  useEffect(() => {
    apiJson<TwinNode[]>("nodes")
      .then(setNodes)
      .catch((e: unknown) => {
        setError(e instanceof ApiError ? `Error ${e.status}` : "No se pudieron cargar los nodos");
      });
  }, []);

  const simulation = useMemo(
    () => TWIN_SIMULATIONS.find((s) => s.id === simulationType) ?? TWIN_SIMULATIONS[0],
    [simulationType]
  );

  return (
    <div>
      <PageHeader
        title="Gemelo digital"
        description="Three.js solo en esta ruta. Datos de sensores desde el store (REST + WebSocket), no llamadas directas desde la escena."
      />
      {error ? <p className="mb-3 text-sm text-amber-400">{error}</p> : null}
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <TwinCanvas nodes={nodes} onSelectSensor={setSelected} />
        <aside className="space-y-4 rounded-lg border border-slate-800 bg-slate-950/50 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Modo del gemelo</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("REAL")}
                className={`rounded-md px-3 py-1.5 ${mode === "REAL" ? "bg-teal-700 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                REAL
              </button>
              <button
                type="button"
                onClick={() => setMode("SIMULATION")}
                className={`rounded-md px-3 py-1.5 ${mode === "SIMULATION" ? "bg-teal-700 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                SIMULACION
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <label className="text-xs uppercase tracking-wide text-slate-500">Escenario visual</label>
            <select
              value={simulationType}
              onChange={(e) => setSimulationType(e.target.value as typeof simulationType)}
              disabled={mode !== "SIMULATION"}
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-2 text-sm disabled:opacity-50"
            >
              {TWIN_SIMULATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="mt-3 space-y-2">
              {simulation.controls.map((c) => {
                const v = Number(params[c.key] ?? c.min);
                return (
                  <label key={c.key} className="block">
                    <span className="text-xs text-slate-400">
                      {c.label}: {v.toFixed(c.step < 1 ? 2 : 0)} {c.unit}
                    </span>
                    <input
                      type="range"
                      min={c.min}
                      max={c.max}
                      step={c.step}
                      value={v}
                      disabled={mode !== "SIMULATION"}
                      onChange={(e) => setParam(c.key, Number(e.target.value))}
                      className="mt-1 w-full"
                    />
                  </label>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => run()}
                disabled={mode !== "SIMULATION"}
                className="rounded-md bg-teal-700 px-3 py-1.5 text-white disabled:opacity-50"
              >
                Ejecutar
              </button>
              <button
                type="button"
                onClick={() => stop()}
                disabled={mode !== "SIMULATION" || !running}
                className="rounded-md bg-slate-700 px-3 py-1.5 text-slate-100 disabled:opacity-50"
              >
                Detener
              </button>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Sensor seleccionado</p>
            {selected ? (
              <div className="mt-2 rounded-md border border-slate-800 bg-slate-900 p-3">
                <p className="font-medium text-slate-100">{selected.name}</p>
                <p className="text-slate-400">Estado: {selected.status}</p>
                {typeof selected.value === "number" ? (
                  <p className="text-slate-300">
                    Lectura: {selected.value} {selected.unit ?? ""}
                  </p>
                ) : (
                  <p className="text-slate-500">Sin lectura reciente por WS</p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-slate-500">Haz click sobre un nodo para ver su estado y lectura.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
