export type SimulationControl = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
};

export type TwinSimulation = {
  id: "WATER_LEVEL_RISE" | "HEAVY_RAIN" | "DIKE_SATURATION" | "SAFETY_FACTOR" | "SEEPAGE_DETECTION";
  label: string;
  controls: SimulationControl[];
};

export const TWIN_SIMULATIONS: TwinSimulation[] = [
  {
    id: "WATER_LEVEL_RISE",
    label: "Subida de nivel",
    controls: [{ key: "fillRate", label: "Tasa llenado", min: 0, max: 120, step: 1, unit: "m3/dia" }],
  },
  {
    id: "HEAVY_RAIN",
    label: "Lluvia intensa",
    controls: [{ key: "rainIntensity", label: "Intensidad lluvia", min: 0, max: 80, step: 1, unit: "mm/h" }],
  },
  {
    id: "DIKE_SATURATION",
    label: "Saturacion dique",
    controls: [{ key: "relaveLevel", label: "Nivel relave", min: 774, max: 785, step: 0.1, unit: "msnm" }],
  },
  {
    id: "SAFETY_FACTOR",
    label: "Factor de seguridad",
    controls: [
      { key: "relaveLevel", label: "Nivel relave", min: 774, max: 785, step: 0.1, unit: "msnm" },
      { key: "seismic", label: "Aceleracion sismica", min: 0, max: 0.25, step: 0.01, unit: "g" },
    ],
  },
  {
    id: "SEEPAGE_DETECTION",
    label: "Filtracion",
    controls: [{ key: "seepageFlow", label: "Caudal filtracion", min: 0, max: 50, step: 1, unit: "L/min" }],
  },
];
