import { create } from "zustand";

export type TwinMode = "REAL" | "SIMULATION";

interface SimulationState {
  mode: TwinMode;
  simulationType: "WATER_LEVEL_RISE" | "HEAVY_RAIN" | "DIKE_SATURATION" | "SAFETY_FACTOR" | "SEEPAGE_DETECTION";
  params: Record<string, number | string>;
  running: boolean;
  setMode: (mode: TwinMode) => void;
  setSimulationType: (simulationType: SimulationState["simulationType"]) => void;
  setParam: (key: string, value: number | string) => void;
  run: () => void;
  stop: () => void;
}

const DEFAULT_PARAMS: Record<string, number | string> = {
  fillRate: 60,
  rainIntensity: 20,
  relaveLevel: 780,
  seismic: 0,
  seepageFlow: 0,
};

export const useSimulationStore = create<SimulationState>((set) => ({
  mode: "REAL",
  simulationType: "WATER_LEVEL_RISE",
  params: DEFAULT_PARAMS,
  running: false,
  setMode: (mode) => set({ mode }),
  setSimulationType: (simulationType) => set({ simulationType }),
  setParam: (key, value) => set((s) => ({ params: { ...s.params, [key]: value } })),
  run: () => set({ running: true }),
  stop: () => set({ running: false }),
}));
