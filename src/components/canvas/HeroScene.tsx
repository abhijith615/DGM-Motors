'use client';

import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { volumetricFragment, volumetricVertex } from './shaders/volumetric';
import { dustFragment, dustVertex } from './shaders/dust';
import { seededRandom } from '@/lib/utils';

const RED = new THREE.Color('#e81e26');
const COOL = new THREE.Color('#c8d4d8');
const BASE = new THREE.Color('#08090a');

type Driver = {
  /** Page scroll 0 → 1. */
  scroll: RefObject<number>;
  /** Normalised pointer, already smoothed. */
  mouse: RefObject<{ x: number; y: number }>;
};

/* ========================================================================== */
/* Backdrop                                                                    */
/* ========================================================================== */

/**
 * Full-frustum quad carrying the volumetric shader. Sized from the camera each
 * frame so it always exactly fills the view without being scaled up wastefully.
 */
function Volumetric({ scroll, mouse }: Driver) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport, camera } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uAspect: { value: 1 },
      uIntensity: { value: 1 },
      uRed: { value: RED },
      uCool: { value: COOL },
      uBase: { value: BASE },
    }),
    []
  );

  // Depth of the backdrop plane behind the girders.
  const Z = -9;

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uScroll.value = scroll.current;
    uniforms.uMouse.value.set(mouse.current.x, mouse.current.y);

    const v = viewport.getCurrentViewport(camera, [0, 0, Z]);
    uniforms.uAspect.value = v.width / v.height;

    // Dim the whole volume as the hero scrolls away so the section below
    // doesn't have to fight it for attention.
    uniforms.uIntensity.value = 1 - Math.min(scroll.current * 4.5, 0.85);

    if (mesh.current) mesh.current.scale.set(v.width, v.height, 1);
  });

  return (
    <mesh ref={mesh} position={[0, 0, Z]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={volumetricVertex}
        fragmentShader={volumetricFragment}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
}

/* ========================================================================== */
/* Dust                                                                        */
/* ========================================================================== */

function Dust({ scroll, count = 1400 }: { scroll: RefObject<number>; count?: number }) {
  const points = useRef<THREE.Points>(null);

  const { geometry, uniforms } = useMemo(() => {
    const rand = seededRandom(20241); // deterministic: identical every mount
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rand() - 0.5) * 22;
      positions[i * 3 + 1] = (rand() - 0.5) * 14;
      // Bias toward the mid-ground so the field has depth without crowding
      // the camera.
      positions[i * 3 + 2] = -1 - rand() * rand() * 11;

      scales[i] = 0.6 + rand() * 2.6;
      speeds[i] = 0.35 + rand() * 1.4;
      phases[i] = rand();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    // The vertex shader wraps positions itself, so an auto-computed bounding
    // sphere would be wrong and cull the whole field. Set it generously.
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 24);

    return {
      geometry: geo,
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0 },
        uPixelRatio: { value: 1 },
        uColorCool: { value: COOL },
        uColorWarm: { value: RED },
      },
    };
  }, [count]);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uScroll.value = scroll.current;
    uniforms.uPixelRatio.value = state.gl.getPixelRatio();
    // Fade the whole field out as the hero leaves rather than letting motes
    // linger over the next section.
    const material = points.current?.material as THREE.ShaderMaterial | undefined;
    if (material) material.opacity = 1 - Math.min(scroll.current * 3, 1);
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={dustVertex}
        fragmentShader={dustFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/* ========================================================================== */
/* Girders                                                                     */
/* ========================================================================== */

/**
 * A drifting lattice of structural beams — the industrial silhouette behind the
 * headline. One InstancedMesh, so 26 girders cost a single draw call.
 *
 * The rotation is applied to the parent group rather than per-instance, which
 * means the per-frame CPU work is one matrix, not 26.
 */
function Girders({ scroll, mouse, count = 26 }: Driver & { count?: number }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);

  // Build the instance matrices once.
  const matrices = useMemo(() => {
    const rand = seededRandom(88123);
    const out: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const long = 3 + rand() * 7;
      const thick = 0.06 + rand() * 0.16;

      dummy.position.set((rand() - 0.5) * 20, (rand() - 0.5) * 12, -2 - rand() * 9);

      // Snap orientation to the three structural axes with only a little
      // deviation — girders in a real workshop are square to the building, and
      // that regularity is what makes it read as architecture not confetti.
      const axis = Math.floor(rand() * 3);
      dummy.rotation.set(
        axis === 0 ? Math.PI / 2 : (rand() - 0.5) * 0.16,
        axis === 1 ? Math.PI / 2 : (rand() - 0.5) * 0.16,
        axis === 2 ? Math.PI / 2 : (rand() - 0.5) * 0.16
      );

      dummy.scale.set(thick, long, thick);
      dummy.updateMatrix();
      out.push(dummy.matrix.clone());
    }

    return out;
  }, [count]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const s = scroll.current;

    // Very slow drift + pointer parallax + scroll push-through.
    group.current.rotation.y = t * 0.018 + mouse.current.x * 0.09;
    group.current.rotation.x = Math.sin(t * 0.11) * 0.02 + mouse.current.y * 0.05;
    group.current.position.z = s * 9;
    group.current.position.y = s * 1.6;
  });

  return (
    <group ref={group}>
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        castShadow={false}
        receiveShadow={false}
        onUpdate={(self) => {
          matrices.forEach((m, i) => self.setMatrixAt(i, m));
          self.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        {/* High metalness + low roughness makes the Lightformers below read as
            hard specular streaks along each beam — the "machined" look. */}
        <meshStandardMaterial color="#2a3236" metalness={1} roughness={0.24} envMapIntensity={1.35} />
      </instancedMesh>
    </group>
  );
}

/* ========================================================================== */
/* Camera rig                                                                  */
/* ========================================================================== */

function Rig({ scroll, mouse }: Driver) {
  const { camera } = useThree();

  useFrame(() => {
    const s = scroll.current;
    // Dolly in and tilt slightly as the hero exits — a camera move, not a
    // CSS translate, so the parallax between depth layers is physically real.
    camera.position.z = 6 - s * 2.4;
    camera.position.x += (mouse.current.x * 0.42 - camera.position.x) * 0.045;
    camera.position.y += (mouse.current.y * 0.28 - camera.position.y) * 0.045;
    camera.lookAt(0, 0, -3);
  });

  return null;
}

/* ========================================================================== */
/* Scene                                                                       */
/* ========================================================================== */

export function HeroScene({ scroll, mouse }: Driver) {
  return (
    <>
      <Volumetric scroll={scroll} mouse={mouse} />
      <Girders scroll={scroll} mouse={mouse} />
      <Dust scroll={scroll} />
      <Rig scroll={scroll} mouse={mouse} />

      {/*
        HDR environment built entirely in-scene from emissive planes. This gives
        real image-based reflections on the girders with zero network cost — no
        .hdr download, no CDN dependency, no CORS. `frames={1}` bakes it once
        into a render target instead of re-rendering the probe every frame.
      */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[-6, 5, -4]} scale={[10, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={4.5} color="#e81e26" position={[7, 1, -3]} scale={[4, 9, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.1} color="#6d797d" position={[0, -6, 2]} scale={[14, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2.0} color="#ffffff" position={[2, 3, 4]} scale={3} target={[0, 0, 0]} />
      </Environment>

      {/* A single key light for the diffuse term; the environment does the rest. */}
      <directionalLight position={[-5, 6, 3]} intensity={0.7} color="#dfe8ea" />
      <ambientLight intensity={0.12} />
    </>
  );
}
