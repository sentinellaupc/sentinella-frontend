import * as THREE from "three";

export type WaterPlaneVisualState = {
  relaveLevel: number;
  fillRate: number;
  rainIntensity: number;
  time: number;
};

export type WaterPlaneMetrics = {
  relaveLevel: number;
  freeboard: number;
};

export type WaterPlaneSystem = {
  update: (state: WaterPlaneVisualState, delta: number) => WaterPlaneMetrics;
  getCurrentHeight: () => number;
  dispose: () => void;
};

const RELAVE_MIN = 774;
const RELAVE_MAX = 787.5;
const CROWN_LEVEL = 786;

function createOrganicWaterGeometry(radius: number): THREE.ShapeGeometry {
  const points: THREE.Vector2[] = [];
  const segments = 110;
  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2;
    const wobbleA = Math.sin(angle * 3.1) * 0.07;
    const wobbleB = Math.cos(angle * 5.4) * 0.045;
    const localRadius = radius * (1 + wobbleA + wobbleB);
    points.push(new THREE.Vector2(Math.cos(angle) * localRadius, Math.sin(angle) * localRadius));
  }
  const shape = new THREE.Shape(points);
  const geometry = new THREE.ShapeGeometry(shape, 38);
  geometry.rotateX(-Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

export function createWaterPlaneSystem(scene: THREE.Scene, basinRadius: number): WaterPlaneSystem {
  const waterGeometry = createOrganicWaterGeometry(basinRadius - 1.4);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x0e7490,
    transparent: true,
    opacity: 0.88,
    roughness: 0.18,
    metalness: 0.06,
  });
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.position.y = 2.8;
  water.receiveShadow = true;
  scene.add(water);

  const liner = new THREE.Mesh(
    new THREE.CircleGeometry(basinRadius - 2.2, 80),
    new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.96, metalness: 0.02 })
  );
  liner.rotation.x = -Math.PI / 2;
  liner.position.y = -0.2;
  liner.scale.set(1.05, 1, 0.97);
  scene.add(liner);

  let smoothLevel = 780;
  const position = waterGeometry.attributes.position as THREE.BufferAttribute;
  const baseLocalY = new Float32Array(position.count);
  for (let i = 0; i < position.count; i += 1) {
    baseLocalY[i] = position.getY(i);
  }

  return {
    update: (state, delta) => {
      const clampedLevel = THREE.MathUtils.clamp(state.relaveLevel, RELAVE_MIN, RELAVE_MAX);
      smoothLevel = THREE.MathUtils.lerp(smoothLevel, clampedLevel, THREE.MathUtils.clamp(delta * 1.4, 0.02, 0.2));

      const relaveNorm = THREE.MathUtils.clamp((smoothLevel - RELAVE_MIN) / (RELAVE_MAX - RELAVE_MIN), 0, 1);
      water.position.y = 0.55 + relaveNorm * 9.8;

      const wave = Math.sin(state.time * 0.95) * 0.008 + Math.cos(state.time * 0.43) * 0.005;
      const rainWave = (state.rainIntensity / 90) * Math.sin(state.time * 6.5) * 0.006;
      const fillWave = (state.fillRate / 220) * Math.sin(state.time * 1.2) * 0.004;
      const scale = 1 + wave + rainWave + fillWave;
      water.scale.set(scale, scale, scale);

      for (let i = 0; i < position.count; i += 1) {
        const x = position.getX(i);
        const z = position.getZ(i);
        const radial = Math.sqrt(x * x + z * z) / basinRadius;
        const smoothRadial = 1 - THREE.MathUtils.clamp(radial, 0, 1);
        const ripple =
          Math.sin(x * 0.085 + state.time * 1.9) * 0.035 +
          Math.cos(z * 0.09 + state.time * 1.6) * 0.03 +
          Math.sin((x + z) * 0.05 + state.time * 4.6) * (state.rainIntensity / 90) * 0.08;
        position.setY(i, baseLocalY[i] + ripple * smoothRadial);
      }
      position.needsUpdate = true;
      waterGeometry.computeVertexNormals();

      const severe = smoothLevel >= 785.4 || CROWN_LEVEL - smoothLevel <= 1;
      waterMaterial.color.set(severe ? 0xb91c1c : 0x0e7490);
      waterMaterial.opacity = severe ? 0.93 : 0.88;

      return {
        relaveLevel: smoothLevel,
        freeboard: CROWN_LEVEL - smoothLevel,
      };
    },
    getCurrentHeight: () => water.position.y,
    dispose: () => {
      scene.remove(water);
      scene.remove(liner);
      waterGeometry.dispose();
      waterMaterial.dispose();
      liner.geometry.dispose();
      (liner.material as THREE.Material).dispose();
    },
  };
}
