'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { HeroScene } from './HeroScene';
import { HeroFallback } from './HeroFallback';
import { useScrollProgressRef } from '@/hooks/useScrollProgress';

/**
 * Decides whether this device should run the WebGL hero at all, and hosts the
 * canvas if so.
 *
 * The gate matters more than the scene: a beautiful 60 FPS hero on a desktop is
 * a 12 FPS space heater on a mid-range Android. Everything that fails the gate
 * gets `<HeroFallback/>`, which is a pure-CSS approximation of the same
 * composition — not a blank box.
 */
export default function HeroCanvas() {
  const scroll = useScrollProgressRef();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(true);

  /* --- capability gate --------------------------------------------------- */

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Touch-first / narrow viewports: the hero is mostly type there anyway, and
    // the battery cost isn't worth the few visible pixels behind it.
    if (window.matchMedia('(max-width: 767px)').matches) return;

    // Confirm a real WebGL2 context before mounting — some environments report
    // the API but fail on creation (headless, blocklisted drivers, VMs).
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return;
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      return;
    }

    // A very rough proxy for "this machine has cores to spare".
    if ((navigator.hardwareConcurrency ?? 4) < 4) return;

    setEnabled(true);
  }, []);

  /* --- pointer, smoothed off the React render path ----------------------- */

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    let raf = 0;
    const tick = () => {
      // Critically-damped-ish follow. The scene reads `mouse`, never `target`,
      // so a flicked pointer never snaps the camera.
      mouse.current.x += (target.current.x - mouse.current.x) * 0.055;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.055;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, [enabled]);

  /* --- stop rendering once the hero is off screen ------------------------ */

  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || !enabled) return;

    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0 });
    io.observe(el);

    // A backgrounded tab should not be burning GPU either.
    const onVisibility = () => setVisible(!document.hidden && !!host.current);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled]);

  if (!enabled) return <HeroFallback />;

  return (
    <div ref={host} className="absolute inset-0" aria-hidden>
      <Canvas
        // `demand` would be wrong here — the scene animates continuously — but
        // `frameloop` flips to 'never' the moment the hero leaves the viewport,
        // which is the same saving without the plumbing.
        frameloop={visible ? 'always' : 'never'}
        // Cap DPR at 1.75: beyond that the shader cost doubles for a difference
        // nobody can see through a grain overlay.
        dpr={[1, 1.75]}
        camera={{ fov: 42, position: [0, 0, 6], near: 0.1, far: 40 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          // No transparency to read back and no stencil work in this scene.
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl, scene }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          scene.background = new THREE.Color('#08090a');
        }}
      >
        <Suspense fallback={null}>
          <HeroScene scroll={scroll} mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}

