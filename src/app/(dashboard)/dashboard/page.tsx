"use client";

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApiError, apiJson } from "@/lib/api/http";
import { useSessionStore } from "@/stores/useSessionStore";

type Executive = {
  totalNodes?: number;
  activeAlerts?: number;
  criticalAlerts?: number;
  nodesWithRecentData?: number;
};

type FieldKpi = {
  activeAlerts?: number;
  roundsInProgress?: number;
  pendingSyncRounds?: number;
};

export default function ExecutiveDashboardPage() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const user = useSessionStore((s) => s.user);
  const [kpi, setKpi] = useState<Executive | null>(null);
  const [field, setField] = useState<FieldKpi | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    useSessionStore.getState().hydrate();
  }, []);

  useEffect(() => {
    let chart: echarts.ECharts | null = null;
    if (chartRef.current) {
      chart = echarts.init(chartRef.current);
      chart.setOption({
        backgroundColor: "transparent",
        textStyle: { color: "#94a3b8" },
        tooltip: { trigger: "axis" },
        xAxis: { type: "category", data: ["Nodos", "Alertas", "Criticas", "Datos recientes"] },
        yAxis: { type: "value", splitLine: { lineStyle: { color: "#334155" } } },
        series: [
          {
            type: "bar",
            data: [
              kpi?.totalNodes ?? 0,
              kpi?.activeAlerts ?? 0,
              kpi?.criticalAlerts ?? 0,
              kpi?.nodesWithRecentData ?? 0,
            ],
            itemStyle: { color: "#0d9488" },
          },
        ],
      });
    }
    return () => {
      chart?.dispose();
    };
  }, [kpi]);

  useEffect(() => {
    apiJson<Executive>("dashboard/executive")
      .then(setKpi)
      .catch((e: unknown) => {
        if (e instanceof ApiError) {
          setError(`No se pudieron cargar KPI (${e.status})`);
        } else {
          setError("No se pudieron cargar KPI");
        }
      });
  }, []);

  useEffect(() => {
    const role = user?.role;
    if (!role || role === "READ_ONLY") {
      return;
    }
    setFieldError(null);
    apiJson<FieldKpi>("dashboard/field")
      .then(setField)
      .catch((e: unknown) => {
        if (e instanceof ApiError) {
          setFieldError(`Campo: ${e.status}`);
        } else {
          setFieldError("Campo: error");
        }
      });
  }, [user?.role]);

  return (
    <div>
      <PageHeader
        title="Dashboard ejecutivo"
        description="KPIs consolidados (GET /v1/dashboard/executive). Gráficos con ECharts según blueprint."
      />
      {error ? <p className="mb-4 text-sm text-amber-400">{error}</p> : null}
      <div ref={chartRef} className="h-72 w-full max-w-3xl rounded-lg border border-slate-800 bg-slate-950/50 p-2" />
      {kpi ? (
        <ul className="mt-4 grid max-w-3xl grid-cols-2 gap-3 text-sm text-slate-300 md:grid-cols-4">
          <li className="rounded-md border border-slate-800 p-3">Nodos: {kpi.totalNodes ?? "—"}</li>
          <li className="rounded-md border border-slate-800 p-3">Alertas: {kpi.activeAlerts ?? "—"}</li>
          <li className="rounded-md border border-slate-800 p-3">Criticas: {kpi.criticalAlerts ?? "—"}</li>
          <li className="rounded-md border border-slate-800 p-3">Datos recientes: {kpi.nodesWithRecentData ?? "—"}</li>
        </ul>
      ) : null}
      {fieldError ? <p className="mt-4 text-xs text-slate-500">{fieldError}</p> : null}
      {field ? (
        <div className="mt-6 max-w-3xl rounded-lg border border-slate-800 p-4">
          <h2 className="text-sm font-semibold text-slate-200">Dashboard de campo</h2>
          <p className="text-xs text-slate-500">GET /v1/dashboard/field</p>
          <ul className="mt-3 grid grid-cols-3 gap-2 text-sm text-slate-300">
            <li className="rounded border border-slate-800 p-2">Alertas: {field.activeAlerts ?? "—"}</li>
            <li className="rounded border border-slate-800 p-2">Rondas en curso: {field.roundsInProgress ?? "—"}</li>
            <li className="rounded border border-slate-800 p-2">Sync pendiente: {field.pendingSyncRounds ?? "—"}</li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}
