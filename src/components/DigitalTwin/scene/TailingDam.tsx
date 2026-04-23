import * as THREE from "three";

export type TailingDamVisualState = {
  rainIntensity: number;
  saturation: number;
  safetyFactor: number;
  seepageFlow: number;
  seepageLocation: string;
  freeboard: number;
  showSaturationMap: boolean;
  showFlowVector: boolean;
  time: number;
};

export type TailingDamSystem = {
  update: (state: TailingDamVisualState) => void;
  dispose: () => void;
  basinRadius: number;
};

const seepageTargets: Record<string, THREE.Vector3> = {
  "Talud Sur (PI-01)": new THREE.Vector3(-32, 0.7, 44),
  "Base Central (PI-03)": new THREE.Vector3(0, 0.5, 0),
  "Talud Norte (PI-05)": new THREE.Vector3(32, 0.7, -44),
};

function applyDikeIrregularity(geometry: THREE.BufferGeometry, amplitude: number): void {
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const angle = Math.atan2(z, x);
    const mod = Math.sin(angle * 3.2) * amplitude + Math.cos(angle * 5.5) * amplitude * 0.55;
    pos.setXYZ(i, x * (1 + mod), y, z * (1 - mod * 0.6));
  }
  pos.needsUpdate = true;
  geometry.computeVertexNormals();
}

function colorBySafetyFactor(safetyFactor: number): number {
  if (safetyFactor <= 1.0) {
    return 0xef4444;
  }
  if (safetyFactor <= 1.2) {
    return 0xf59e0b;
  }
  return 0x7c6a55;
}

export function createTailingDamSystem(scene: THREE.Scene): TailingDamSystem {
  const group = new THREE.Group();
  const basinRadius = 73;

  const outerDam = new THREE.Mesh(
    new THREE.TorusGeometry(basinRadius + 5, 5.4, 24, 128),
    new THREE.MeshStandardMaterial({ color: 0x7c6a55, roughness: 0.9, metalness: 0.04 })
  );
  applyDikeIrregularity(outerDam.geometry, 0.035);
  outerDam.rotation.x = Math.PI / 2;
  outerDam.position.y = 6.1;
  outerDam.castShadow = true;
  outerDam.receiveShadow = true;
  group.add(outerDam);

  const crown = new THREE.Mesh(
    new THREE.TorusGeometry(basinRadius + 5, 1.5, 12, 120),
    new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.55, metalness: 0.08 })
  );
  applyDikeIrregularity(crown.geometry, 0.022);
  crown.rotation.x = Math.PI / 2;
  crown.position.y = 10.7;
  group.add(crown);

  const canalMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    emissive: 0x0f172a,
    emissiveIntensity: 0.2,
    roughness: 0.65,
    metalness: 0.12,
  });
  const canal = new THREE.Mesh(new THREE.TorusGeometry(basinRadius + 12, 1.2, 14, 120), canalMaterial);
  applyDikeIrregularity(canal.geometry, 0.018);
  canal.rotation.x = Math.PI / 2;
  canal.position.y = 3.3;
  group.add(canal);

  const saturationMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    transparent: true,
    opacity: 0,
    roughness: 0.35,
    metalness: 0.05,
  });
  const saturationOverlay = new THREE.Mesh(new THREE.TorusGeometry(basinRadius + 4.8, 5.55, 22, 128), saturationMaterial);
  applyDikeIrregularity(saturationOverlay.geometry, 0.035);
  saturationOverlay.rotation.x = Math.PI / 2;
  saturationOverlay.position.y = 6.2;
  group.add(saturationOverlay);

  const stressOverlayMaterial = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.02,
    emissive: 0x78350f,
    emissiveIntensity: 0.1,
    roughness: 0.4,
    metalness: 0.05,
  });
  const stressOverlay = new THREE.Mesh(new THREE.TorusGeometry(basinRadius + 5, 5.65, 22, 128), stressOverlayMaterial);
  applyDikeIrregularity(stressOverlay.geometry, 0.035);
  stressOverlay.rotation.x = Math.PI / 2;
  stressOverlay.position.y = 6.2;
  group.add(stressOverlay);

  const overflowRingMaterial = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.02,
    roughness: 0.25,
    metalness: 0.04,
  });
  const overflowRing = new THREE.Mesh(new THREE.TorusGeometry(basinRadius + 5.2, 1.1, 10, 120), overflowRingMaterial);
  applyDikeIrregularity(overflowRing.geometry, 0.02);
  overflowRing.rotation.x = Math.PI / 2;
  overflowRing.position.y = 11.0;
  group.add(overflowRing);

  const overflowStreams = new THREE.Group();
  const streamMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0284c7,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.5,
    roughness: 0.2,
    metalness: 0.02,
  });
  for (let i = 0; i < 18; i += 1) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 10.5, 8), streamMaterial);
    const angle = (i / 18) * Math.PI * 2;
    mesh.position.set(Math.cos(angle) * (basinRadius + 8), 6.2, Math.sin(angle) * (basinRadius + 8));
    mesh.rotation.z = Math.PI / 15;
    mesh.visible = false;
    overflowStreams.add(mesh);
  }
  group.add(overflowStreams);

  const emergencyBeacon = new THREE.PointLight(0xef4444, 0, 45, 2);
  emergencyBeacon.position.set(0, 14, 0);
  group.add(emergencyBeacon);

  const seepageSource = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1d4ed8, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 })
  );
  seepageSource.visible = false;
  group.add(seepageSource);

  const seepageFlow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.22, 8, 10),
    new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x1d4ed8, emissiveIntensity: 0.3, transparent: true, opacity: 0.65 })
  );
  seepageFlow.rotation.z = Math.PI / 5;
  seepageFlow.visible = false;
  group.add(seepageFlow);

  const flowVector = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 3.5, 0), 16, 0x93c5fd, 3, 1.5);
  flowVector.visible = false;
  group.add(flowVector);

  const decantPond = new THREE.Mesh(
    new THREE.CylinderGeometry(7, 7, 0.7, 24),
    new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.38, metalness: 0.08 })
  );
  decantPond.position.set(-26, 0.45, 58);
  group.add(decantPond);

  const pipeline = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 58, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.3 })
  );
  pipeline.rotation.z = Math.PI / 8;
  pipeline.position.set(40, 1.2, 50);
  group.add(pipeline);
  group.scale.set(1.08, 1, 0.94);

  scene.add(group);

  return {
    basinRadius,
    update: (state) => {
      const rain = THREE.MathUtils.clamp(state.rainIntensity, 0, 80);
      const saturation = THREE.MathUtils.clamp(state.saturation, 0, 1);
      const seepageNorm = THREE.MathUtils.clamp(state.seepageFlow / 50, 0, 1);
      const overflowSeverity = THREE.MathUtils.clamp((1 - state.freeboard) / 1.4, 0, 1);

      const hazardColor = colorBySafetyFactor(state.safetyFactor);
      (outerDam.material as THREE.MeshStandardMaterial).color.set(hazardColor);

      canalMaterial.color.set(rain >= 45 ? 0xef4444 : rain >= 30 ? 0xf59e0b : 0x334155);
      canalMaterial.emissive.set(rain >= 45 ? 0x7f1d1d : rain >= 30 ? 0x78350f : 0x0f172a);
      canalMaterial.emissiveIntensity = THREE.MathUtils.lerp(0.2, 1.1, rain / 80);

      saturationOverlay.visible = state.showSaturationMap;
      saturationMaterial.opacity = state.showSaturationMap ? 0.05 + saturation * 0.45 : 0;
      saturationMaterial.color.set(saturation > 0.8 ? 0xdc2626 : saturation > 0.6 ? 0xf59e0b : 0x1d4ed8);

      stressOverlayMaterial.opacity = THREE.MathUtils.clamp((1.4 - state.safetyFactor) * 0.22, 0.01, 0.42);
      stressOverlayMaterial.color.set(state.safetyFactor <= 1 ? 0xef4444 : state.safetyFactor <= 1.2 ? 0xf59e0b : 0x22c55e);
      stressOverlayMaterial.emissive.set(state.safetyFactor <= 1 ? 0x7f1d1d : 0x78350f);
      stressOverlayMaterial.emissiveIntensity = THREE.MathUtils.clamp((1.5 - state.safetyFactor) * 0.9, 0.08, 0.85);

      overflowRingMaterial.opacity = overflowSeverity > 0 ? 0.12 + overflowSeverity * 0.52 : 0.02;
      overflowRingMaterial.emissiveIntensity = 0.1 + overflowSeverity * 1.3;
      overflowRingMaterial.color.set(overflowSeverity > 0.6 ? 0xef4444 : 0x38bdf8);
      overflowRing.scale.setScalar(1 + Math.sin(state.time * 2.6) * overflowSeverity * 0.04);

      overflowStreams.children.forEach((child, idx) => {
        const stream = child as THREE.Mesh;
        stream.visible = overflowSeverity > 0.08;
        stream.scale.y = stream.visible ? 0.35 + overflowSeverity * 1.5 + Math.sin(state.time * 3.4 + idx) * 0.12 : 0.2;
      });

      emergencyBeacon.intensity =
        overflowSeverity > 0.02 || state.safetyFactor <= 1.1
          ? (1.2 + Math.sin(state.time * 6) * 0.7) * Math.max(overflowSeverity, THREE.MathUtils.clamp((1.2 - state.safetyFactor) / 0.3, 0, 1))
          : 0;

      const seepagePosition = seepageTargets[state.seepageLocation] ?? seepageTargets["Base Central (PI-03)"];
      seepageSource.position.copy(seepagePosition);
      seepageSource.visible = seepageNorm > 0.02;
      const seepageMaterial = seepageSource.material as THREE.MeshStandardMaterial;
      seepageMaterial.emissiveIntensity = 0.4 + seepageNorm * 1.5;
      seepageMaterial.opacity = 0.7 + seepageNorm * 0.25;
      seepageSource.scale.setScalar(0.85 + seepageNorm * 1.5);

      seepageFlow.visible = seepageNorm > 0.02;
      seepageFlow.position.copy(seepagePosition).add(new THREE.Vector3(2.2, -2.2, 0));
      seepageFlow.scale.y = 0.7 + seepageNorm * 2.5;
      seepageFlow.rotation.y = Math.sin(state.time * 0.7) * 0.25;

      flowVector.visible = state.showFlowVector;
      flowVector.position.set(0, 3.5, 0);
      flowVector.setLength(12 + rain * 0.2, 3, 1.4);
      flowVector.setDirection(new THREE.Vector3(1, -0.2, Math.sin(state.time * 0.2) * 0.3).normalize());
      flowVector.setColor(new THREE.Color(rain >= 45 ? 0xef4444 : 0x93c5fd));
    },
    dispose: () => {
      scene.remove(group);
      group.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if ("geometry" in mesh && mesh.geometry) {
          mesh.geometry.dispose();
        }
        const material = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else if (material) {
          material.dispose();
        }
      });
    },
  };
}
