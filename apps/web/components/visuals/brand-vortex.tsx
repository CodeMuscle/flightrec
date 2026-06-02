"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// three.js emits a harmless `THREE.Clock` deprecation through r3f internals; drop just that line.
if (typeof window !== "undefined") {
  const w = window as unknown as { __frClockPatched?: boolean };
  if (!w.__frClockPatched) {
    w.__frClockPatched = true;
    const orig = console.warn.bind(console);
    console.warn = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("THREE.Clock")) return;
      orig(...(args as Parameters<typeof orig>));
    };
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(m.matches);
    update();
    m.addEventListener("change", update);
    return () => m.removeEventListener("change", update);
  }, []);
  return reduced;
}

type Vel = { x: number; y: number };

function Glyph({
  velRef,
  dragRef,
  reduced,
}: {
  velRef: React.RefObject<Vel>;
  dragRef: React.RefObject<boolean>;
  reduced: boolean;
}) {
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

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    if (reduced) {
      g.rotation.set(-0.12, 0.42, 0);
      return;
    }
    g.rotation.x += velRef.current.x;
    g.rotation.y += velRef.current.y;
    const damp = dragRef.current ? 0.6 : 0.95;
    velRef.current.x *= damp;
    velRef.current.y *= damp;
    if (!dragRef.current) {
      g.rotation.y += 0.0015; // gentle idle spin
      g.rotation.x += (-0.1 - g.rotation.x) * 0.01; // ease tilt back to rest
    }
    g.rotation.x = THREE.MathUtils.clamp(g.rotation.x, -1.2, 1.2);
  });

  return (
    <group ref={ref} rotation={[-0.12, 0.42, 0]} scale={1.15}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#7b78f5"
          emissive="#5b5bd6"
          emissiveIntensity={0.7}
          metalness={0.7}
          roughness={0.22}
        />
      </mesh>
    </group>
  );
}

export function BrandVortex() {
  const velRef = useRef<Vel>({ x: 0, y: 0 });
  const dragRef = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [grabbing, setGrabbing] = useState(false);
  const reduced = usePrefersReducedMotion();

  const onDown = (e: React.PointerEvent) => {
    dragRef.current = true;
    setGrabbing(true);
    last.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    velRef.current.y += (e.clientX - last.current.x) * 0.005;
    velRef.current.x += (e.clientY - last.current.y) * 0.005;
    last.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = () => {
    dragRef.current = false;
    setGrabbing(false);
  };

  return (
    <div
      className={`relative aspect-square w-full max-w-130 touch-none select-none ${grabbing ? "cursor-grabbing" : "cursor-grab"}`}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      <div
        className="pointer-events-none absolute inset-0 m-auto size-3/4 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(111,108,240,0.28), rgba(91,182,244,0.12) 55%, transparent 72%)" }}
      />
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={2.6} color="#8b88ff" />
        <directionalLight position={[-4, -2, 2]} intensity={1.6} color="#5bb6f4" />
        <directionalLight position={[0, 3, -4]} intensity={1} color="#a78bfa" />

        <Float speed={reduced ? 0 : 2} rotationIntensity={reduced ? 0 : 0.12} floatIntensity={reduced ? 0 : 0.7}>
          <Glyph velRef={velRef} dragRef={dragRef} reduced={reduced} />
        </Float>

        {/* dust motes drifting in a sunbeam — small + slow, but saturated enough to read on white */}
        <Sparkles count={reduced ? 45 : 90} scale={[8, 8, 5]} size={3.4} speed={reduced ? 0 : 0.25} noise={0.6} color="#7b78f0" opacity={0.75} />
        <Sparkles count={reduced ? 22 : 40} scale={[6, 6, 4]} size={2.1} speed={reduced ? 0 : 0.16} color="#9d99ff" opacity={0.6} />
      </Canvas>
    </div>
  );
}
