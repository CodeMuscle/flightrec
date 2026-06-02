"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/** A fully 3D extruded rewind glyph that tilts to the cursor. */
function Glyph() {
  const ref = useRef<THREE.Group>(null);

  const geometry = useMemo(() => {
    const t1 = new THREE.Shape();
    t1.moveTo(0, 1);
    t1.lineTo(-1, 0);
    t1.lineTo(0, -1);
    t1.closePath();
    const t2 = new THREE.Shape();
    t2.moveTo(1.2, 1);
    t2.lineTo(0.2, 0);
    t2.lineTo(1.2, -1);
    t2.closePath();
    const g = new THREE.ExtrudeGeometry([t1, t2], {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.09,
      bevelSize: 0.09,
      bevelSegments: 4,
      steps: 1,
    });
    g.center();
    return g;
  }, []);

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    // angled at rest so the extruded depth always reads; tilts toward the cursor
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, 0.42 + state.pointer.x * 0.5, 0.06);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.12 - state.pointer.y * 0.4, 0.06);
  });

  return (
    <group ref={ref} scale={1.15}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#7b78f5"
          emissive="#4f46e5"
          emissiveIntensity={0.55}
          metalness={0.7}
          roughness={0.22}
        />
      </mesh>
    </group>
  );
}

export function BrandVortex() {
  return (
    <div className="relative aspect-square w-full max-w-[520px]">
      {/* soft halo so the neon glitter reads on the light ground */}
      <div
        className="pointer-events-none absolute inset-0 m-auto size-2/3 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(111,108,240,0.2), transparent 70%)" }}
      />
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.6} color="#8b88ff" />
        <directionalLight position={[-4, -2, 2]} intensity={1.6} color="#5bb6f4" />
        <directionalLight position={[0, 3, -4]} intensity={1} color="#a78bfa" />

        <Float speed={2.2} rotationIntensity={0.45} floatIntensity={0.8}>
          <Glyph />
        </Float>

        <Sparkles count={90} scale={[7.5, 7.5, 4]} size={5} speed={0.6} noise={1.4} color="#8b88ff" opacity={1} />
        <Sparkles count={40} scale={[5.5, 5.5, 3]} size={3} speed={0.4} color="#5bb6f4" opacity={0.9} />
      </Canvas>
    </div>
  );
}
