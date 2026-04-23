"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SENSOR_POSITIONS } from "@/components/DigitalTwin/sensorPositions";
import { useSensorStore } from "@/stores/useSensorStore";
import { useSimulationStore } from "@/stores/useSimulationStore";

type TwinNode = {
  id: string;
  externalId?: string;
  name: string;
  sensorType?: string;
  status?: string;
};

type Props = {
  nodes: TwinNode[];
  onSelectSensor?: (sensor: { nodeId: string; name: string; status: string; value?: number; unit?: string }) => void;
};

/**
 * Gemelo digital (Three.js) — §9.2: vaso ~17 000 m² (radio ~73 m escala 1:1), nivel de relave,
 * corona del dique (~12 m sobre terreno), borde libre referencia MINEM 1 m en simulaciones.
 */
export default function TwinCanvas({ nodes, onSelectSensor }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return;
    }

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500);
    camera.position.set(95, 55, 110);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;

    scene.add(new THREE.AmbientLight(0xffffff, 0.42));
    const dir = new THREE.DirectionalLight(0xffffff, 0.95);
    dir.position.set(50, 120, 40);
    scene.add(dir);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(320, 320),
      new THREE.MeshStandardMaterial({ color: 0xb8a078, roughness: 0.96 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.6;
    scene.add(ground);

    const terrainRing = new THREE.Mesh(
      new THREE.RingGeometry(82, 128, 96),
      new THREE.MeshStandardMaterial({ color: 0x9f8a67, roughness: 0.98 })
    );
    terrainRing.rotation.x = -Math.PI / 2;
    terrainRing.position.y = -0.35;
    scene.add(terrainRing);

    const basinRadius = 73;
    const waterGeom = new THREE.CircleGeometry(basinRadius, 72);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0e7490,
      transparent: true,
      opacity: 0.88,
      roughness: 0.2,
      metalness: 0.05,
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 2.85;
    scene.add(water);

    const liner = new THREE.Mesh(
      new THREE.CircleGeometry(basinRadius - 2, 72),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 1 })
    );
    liner.rotation.x = -Math.PI / 2;
    liner.position.y = -0.15;
    scene.add(liner);

    const dikeGeom = new THREE.TorusGeometry(basinRadius + 5, 4.2, 14, 96);
    const dikeMat = new THREE.MeshStandardMaterial({ color: 0x7c6a55, roughness: 0.92 });
    const dike = new THREE.Mesh(dikeGeom, dikeMat);
    dike.rotation.x = Math.PI / 2;
    dike.position.y = 6.2;
    scene.add(dike);

    const canalMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.08 });
    const canal = new THREE.Mesh(new THREE.TorusGeometry(basinRadius + 12, 1.1, 12, 96), canalMat);
    canal.rotation.x = Math.PI / 2;
    canal.position.y = 3.4;
    scene.add(canal);

    const barge = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.9, 2.4),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.45, metalness: 0.2 })
    );
    barge.position.set(0, water.position.y + 0.55, 0);
    scene.add(barge);

    const decantPond = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 0.8, 28),
      new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.35 })
    );
    decantPond.position.set(-26, 0.5, 58);
    scene.add(decantPond);

    const pipeline = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 58, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.3, metalness: 0.35 })
    );
    pipeline.rotation.z = Math.PI / 8;
    pipeline.position.set(40, 1.2, 50);
    scene.add(pipeline);

    const sphereGeom = new THREE.SphereGeometry(2.4, 22, 22);
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const sensorMeshes: THREE.Mesh[] = [];

    const positioned = nodes.map((node, i) => {
      const byExternal = SENSOR_POSITIONS.find((p) => p.nodeId === node.externalId);
      if (byExternal) {
        return { node, x: byExternal.x, y: byExternal.y, z: byExternal.z };
      }
      const a = (i / Math.max(nodes.length, 1)) * Math.PI * 2;
      return { node, x: Math.cos(a) * 46, y: 9 + (i % 3), z: Math.sin(a) * 46 };
    });

    for (const s of positioned) {
      const mesh = new THREE.Mesh(
        sphereGeom,
        new THREE.MeshStandardMaterial({ color: 0x14b8a6, emissive: 0x042f2e, emissiveIntensity: 0.7 })
      );
      mesh.position.set(s.x, s.y, s.z);
      const glow = new THREE.PointLight(0x14b8a6, 1.3, 18, 2);
      glow.position.set(s.x, s.y, s.z);
      glow.userData.nodeId = s.node.id;
      scene.add(glow);
      mesh.userData = { nodeId: s.node.id, name: s.node.name, glow };
      scene.add(mesh);
      sensorMeshes.push(mesh);
    }

    let frame = 0;
    const t0 = performance.now();
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = (performance.now() - t0) / 1000;
      const sim = useSimulationStore.getState();
      const sensor = useSensorStore.getState().lastByNode;
      const relaveSensor = positioned.find((s) => s.node.externalId?.startsWith("NW"));
      const relaveValue = relaveSensor ? sensor[relaveSensor.node.id]?.value : undefined;
      const relaveFromReal = typeof relaveValue === "number" ? relaveValue : 780;
      const relaveFromSim = Number(sim.params.relaveLevel ?? 780);
      const relave = sim.mode === "SIMULATION" && sim.running ? relaveFromSim : relaveFromReal;
      const relaveNorm = THREE.MathUtils.clamp((relave - 774) / 11, 0, 1);
      water.position.y = 0.6 + relaveNorm * 9.6;
      water.scale.setScalar(1 + Math.sin(t * 0.65) * 0.005);
      barge.position.y = water.position.y + 0.55;

      if (sim.mode === "SIMULATION" && sim.running && sim.simulationType === "HEAVY_RAIN") {
        const rain = Number(sim.params.rainIntensity ?? 20);
        canalMat.color.set(rain >= 45 ? 0xef4444 : rain >= 30 ? 0xf59e0b : 0x334155);
      } else {
        canalMat.color.set(0x334155);
      }

      for (const mesh of sensorMeshes) {
        const reading = sensor[String(mesh.userData.nodeId)];
        const status = String(reading?.status ?? "OK").toUpperCase();
        const mat = mesh.material as THREE.MeshStandardMaterial;
        const glow = mesh.userData.glow as THREE.PointLight;
        const pulse = 1 + Math.sin(t * 3) * 0.25;
        if (status.includes("CRITICAL")) {
          mat.color.set(0xef4444);
          mat.emissive.set(0x7f1d1d);
          glow.color.set(0xef4444);
          glow.intensity = 2.3 * pulse;
          continue;
        }
        if (status.includes("WARNING")) {
          mat.color.set(0xf59e0b);
          mat.emissive.set(0x78350f);
          glow.color.set(0xf59e0b);
          glow.intensity = 1.7 * pulse;
          continue;
        }
        mat.color.set(0x14b8a6);
        mat.emissive.set(0x042f2e);
        glow.color.set(0x14b8a6);
        glow.intensity = 1.2;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onClick = (ev: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(sensorMeshes, false)[0];
      if (!hit) {
        return;
      }
      const nodeId = String(hit.object.userData.nodeId);
      const reading = useSensorStore.getState().lastByNode[nodeId];
      const status = String(reading?.status ?? "OK");
      onSelectSensor?.({
        nodeId,
        name: String(hit.object.userData.name ?? nodeId),
        status,
        value: reading?.value,
        unit: reading?.unit,
      });
    };
    renderer.domElement.addEventListener("click", onClick);

    const onResize = () => {
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      sphereGeom.dispose();
      waterGeom.dispose();
      waterMat.dispose();
      dikeGeom.dispose();
      dikeMat.dispose();
      terrainRing.geometry.dispose();
      (terrainRing.material as THREE.Material).dispose();
      liner.geometry.dispose();
      (liner.material as THREE.Material).dispose();
      canal.geometry.dispose();
      canalMat.dispose();
      barge.geometry.dispose();
      (barge.material as THREE.Material).dispose();
      decantPond.geometry.dispose();
      (decantPond.material as THREE.Material).dispose();
      pipeline.geometry.dispose();
      (pipeline.material as THREE.Material).dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
    };
  }, [nodes, onSelectSensor]);

  return <div ref={mountRef} className="h-[min(70vh,560px)] w-full min-h-[400px] rounded-lg border border-teal-900/40" />;
}
