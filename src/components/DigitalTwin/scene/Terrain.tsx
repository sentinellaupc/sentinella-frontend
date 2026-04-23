import * as THREE from "three";

export type TerrainVisualState = {
  showIsolines: boolean;
  rainIntensity: number;
};

export type TerrainSystem = {
  update: (state: TerrainVisualState) => void;
  dispose: () => void;
};

function noise2d(x: number, z: number): number {
  const a = Math.sin(x * 0.022 + z * 0.013) * 0.55;
  const b = Math.cos(x * 0.047 - z * 0.032) * 0.35;
  const c = Math.sin((x + z) * 0.011) * 0.2;
  return a + b + c;
}

export function createTerrainSystem(scene: THREE.Scene): TerrainSystem {
  const terrainGeometry = new THREE.PlaneGeometry(920, 920, 260, 260);
  terrainGeometry.rotateX(-Math.PI / 2);

  const colors = new Float32Array((terrainGeometry.attributes.position.count ?? 0) * 3);
  const position = terrainGeometry.attributes.position as THREE.BufferAttribute;
  const color = new THREE.Color();

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    const protectedBasin = THREE.MathUtils.clamp((dist - 102) / 24, 0, 1);
    const valley = Math.max(0, 1 - dist / 290);
    const ridges = noise2d(x, z) * 22 + noise2d(x * 0.45, z * 0.45) * 34;
    const mountainLift = THREE.MathUtils.smoothstep(dist, 160, 470) * 56;
    const y = (ridges + mountainLift) * protectedBasin - valley * 14 - 2.5;
    position.setY(i, y);

    const hue = THREE.MathUtils.clamp(0.095 + y * 0.0007, 0.08, 0.13);
    const sat = THREE.MathUtils.clamp(0.26 - y * 0.0012, 0.11, 0.3);
    const light = THREE.MathUtils.clamp(0.31 + y * 0.0038, 0.24, 0.58);
    color.setHSL(hue, sat, light);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  terrainGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  terrainGeometry.computeVertexNormals();

  const terrainMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    metalness: 0.02,
  });
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.receiveShadow = true;
  scene.add(terrain);

  const isolines = new THREE.Group();
  const ringMaterial = new THREE.LineBasicMaterial({ color: 0xcfc3a0, transparent: true, opacity: 0.35 });
  for (let radius = 85; radius <= 290; radius += 14) {
    const ringGeometry = new THREE.RingGeometry(radius, radius + 0.2, 100);
    const ring = new THREE.LineLoop(new THREE.EdgesGeometry(ringGeometry), ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.2 + (radius - 85) * 0.01;
    isolines.add(ring);
  }
  isolines.visible = false;
  scene.add(isolines);

  return {
    update: (state) => {
      isolines.visible = state.showIsolines;
      const wetness = THREE.MathUtils.clamp(state.rainIntensity / 100, 0, 0.35);
      terrainMaterial.roughness = 0.92 - wetness * 0.3;
      terrainMaterial.metalness = 0.02 + wetness * 0.08;
    },
    dispose: () => {
      scene.remove(terrain);
      scene.remove(isolines);
      terrainGeometry.dispose();
      terrainMaterial.dispose();
      ringMaterial.dispose();
      isolines.children.forEach((child) => {
        const line = child as THREE.LineLoop;
        line.geometry.dispose();
      });
    },
  };
}
