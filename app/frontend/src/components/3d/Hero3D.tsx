'use client';

/**
 * Hero3D — "Signal Refinement" sculpture.
 *
 * Props:
 *   analyzeActive  — when true, triggers particle surge + node pulse (0.4s)
 *   onAnalyze      — callback fired when user clicks the canvas
 *   prefersReduced — optional override; auto-detected from OS if omitted
 *
 * Performance:
 *   Procedural geometry only (no GLTF), dpr capped at [1, 1.5].
 *   autoRotate pauses on hover. Reduced-motion disables all animation.
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ── Particle field ────────────────────────────────────────────────────────────

function ParticleField({
  count = 500,
  analyzeActive,
  reduced,
}: {
  count?: number;
  analyzeActive: boolean;
  reduced: boolean;
}) {
  const mesh   = useRef<THREE.Points>(null);
  const surge  = useRef(0);

  const { positions, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4;
      spd[i] = Math.random() * 0.4 + 0.1;
    }
    return { positions: pos, speeds: spd };
  }, [count]);

  useFrame(({ clock }, delta) => {
    if (!mesh.current || reduced) return;
    const t = clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes['position']!.array as Float32Array;

    // Surge: ramps to 1 when analyzeActive, decays otherwise
    surge.current = analyzeActive
      ? Math.min(surge.current + delta * 1.5, 1)
      : Math.max(surge.current - delta * 0.8, 0);

    const base  = Math.sin(t * 0.3) * 0.002;
    const boost = surge.current * 0.012;

    for (let i = 0; i < count; i++) {
      const c = base + boost;
      pos[i * 3]     *= 1 - c * (speeds[i] ?? 0.1);
      pos[i * 3 + 1] *= 1 - c * (speeds[i] ?? 0.1);
    }
    mesh.current.geometry.attributes['position']!.needsUpdate = true;
    mesh.current.rotation.y = t * 0.04;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#0EA5A4" sizeAttenuation transparent opacity={reduced ? 0.4 : 0.6} />
    </points>
  );
}

// ── Central orb ───────────────────────────────────────────────────────────────

function CentralOrb({ analyzeActive, reduced }: { analyzeActive: boolean; reduced: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pulse   = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current || reduced) return;
    const t = clock.getElapsedTime();
    meshRef.current.rotation.x = t * 0.15;
    meshRef.current.rotation.y = t * 0.2;

    // Scale pulse: sine envelope for 0.6s on analyzeActive
    pulse.current = analyzeActive
      ? Math.min(pulse.current + delta * 3, 1)
      : Math.max(pulse.current - delta * 2, 0);

    meshRef.current.scale.setScalar(1 + Math.sin(pulse.current * Math.PI) * 0.18);
  });

  return (
    <Float speed={reduced ? 0 : 1.5} rotationIntensity={reduced ? 0 : 0.3} floatIntensity={reduced ? 0 : 0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.9, 2]} />
        <MeshDistortMaterial
          color={analyzeActive ? '#0EA5A4' : '#0d9488'}
          distort={reduced ? 0 : 0.25}
          speed={reduced ? 0 : 1.2}
          roughness={0.15}
          metalness={0.6}
          emissive="#0d9488"
          emissiveIntensity={analyzeActive ? 0.35 : 0.12}
        />
      </mesh>
    </Float>
  );
}

// ── Pointer tilt ──────────────────────────────────────────────────────────────

function SceneTilt({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  useFrame(({ pointer }) => {
    if (!groupRef.current || reduced) return;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x, (-pointer.y * Math.PI) / 24, 0.05,
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, (pointer.x * Math.PI) / 24, 0.05,
    );
    void viewport;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ── Public API ────────────────────────────────────────────────────────────────

interface Hero3DProps {
  analyzeActive?: boolean;
  onAnalyze?: () => void;
  prefersReduced?: boolean;
}

export default function Hero3D({ analyzeActive = false, onAnalyze, prefersReduced }: Hero3DProps) {
  const [hovered, setHovered] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (prefersReduced !== undefined) { setReduced(prefersReduced); return; }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, [prefersReduced]);

  return (
    <div
      className="relative h-[480px] w-full cursor-grab active:cursor-grabbing"
      role="img"
      aria-label="Interactive 3D signal-refinement visualization — particles converging into a teal node"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accessibility: pause/resume */}
      <button
        className="absolute right-3 top-3 z-10 rounded-full border border-border bg-bg-surface/80 px-2.5 py-1 text-[11px] text-text-tertiary backdrop-blur-sm transition-colors hover:text-text-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-500"
        onClick={() => setHovered((v) => !v)}
        aria-pressed={hovered}
        aria-label={hovered ? 'Resume animation' : 'Pause animation'}
      >
        {hovered ? 'Paused' : 'Live'}
      </button>

      {/* Aria-live for screen readers */}
      <div aria-live="polite" className="sr-only">
        {analyzeActive ? 'Analyzing code — signal extraction in progress.' : ''}
      </div>

      <Canvas
        camera={{ position: [0, 0, 5], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onClick={onAnalyze}
        aria-hidden="true"
      >
        <color attach="background" args={['#0B0B0D']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color="#ccfbf1" />
        <pointLight position={[-3, -2, 2]} intensity={analyzeActive ? 1.2 : 0.6} color="#0EA5A4" />

        <SceneTilt reduced={reduced}>
          <ParticleField count={reduced ? 120 : 500} analyzeActive={analyzeActive} reduced={reduced} />
          <CentralOrb analyzeActive={analyzeActive} reduced={reduced} />
        </SceneTilt>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!hovered && !reduced}
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.6}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
        <p className="rounded-full border border-teal-500/20 bg-bg-surface/80 px-4 py-1 text-xs font-medium text-teal-400 backdrop-blur-sm whitespace-nowrap">
          {analyzeActive ? 'Signal extraction active…' : 'Signal refinement · click to analyze'}
        </p>
      </div>
    </div>
  );
}
