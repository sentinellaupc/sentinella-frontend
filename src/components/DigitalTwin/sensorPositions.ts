/** Blueprint §9.2 — posiciones relativas al centro del vaso (Y = altura). */

export type SensorNodePosition = {
  nodeId: string;
  x: number;
  y: number;
  z: number;
  type: string;
  label: string;
};

export const SENSOR_POSITIONS: SensorNodePosition[] = [
  { nodeId: "PI-01", x: -35, y: 2, z: 45, type: "pressure", label: "Piezómetro 1 — Talud Sur" },
  { nodeId: "PI-02", x: -18, y: 2, z: 22, type: "pressure", label: "Piezómetro 2 — Interior Sur" },
  { nodeId: "PI-03", x: 0, y: 2, z: 0, type: "pressure", label: "Piezómetro 3 — Centro" },
  { nodeId: "PI-04", x: 18, y: 2, z: -22, type: "pressure", label: "Piezómetro 4 — Interior Norte" },
  { nodeId: "PI-05", x: 35, y: 2, z: -45, type: "pressure", label: "Piezómetro 5 — Talud Norte" },
  { nodeId: "NW-01", x: 0, y: 10, z: 0, type: "water_level", label: "Nivel Relave — Barcaza" },
  { nodeId: "IN-01", x: -55, y: 12, z: 0, type: "inclination", label: "Inclinómetro — Corona Oeste" },
  { nodeId: "IN-02", x: 55, y: 12, z: 0, type: "inclination", label: "Inclinómetro — Corona Este" },
  { nodeId: "IN-03", x: 0, y: 12, z: 55, type: "inclination", label: "Inclinómetro — Corona Sur" },
  { nodeId: "PH-01", x: -22, y: 1, z: 55, type: "ph", label: "pH/Turbidez — Poza Decant." },
  { nodeId: "PV-01", x: -75, y: 16, z: -30, type: "pluviometer", label: "Pluviómetro — Exterior NW" },
];
