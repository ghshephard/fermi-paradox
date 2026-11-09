import { Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useResults } from '../hooks/useResults';
import { mulberry32 } from '../model/distributions';
import { Starfield } from './Starfield';

const GALAXY = { count: 60_000, radius: 10, branches: 4, spin: 0.9, randomness: 0.35, power: 3 };
const MAX_BEACONS = 600;
const EARTH_RADIUS = 6.2;

const pointVertex = /* glsl */ `
  attribute float size;
  attribute float phase;
  uniform float uTime;
  uniform float uScale;
  uniform float uTwinkle;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float pulse = 1.0 - uTwinkle * 0.5 * (1.0 + sin(uTime * 2.2 + phase));
    vColor = color;
    vAlpha = pulse;
    gl_PointSize = size * uScale * pulse / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const pointFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
    gl_FragColor = vec4(vColor, glow * vAlpha * uOpacity);
  }
`;

const timeUniform = { value: 0 };

function usePointMaterial(opacity: number, twinkle: number) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: pointVertex,
        fragmentShader: pointFragment,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: timeUniform,
          uScale: { value: 140 * Math.min(window.devicePixelRatio, 2) },
          uTwinkle: { value: twinkle },
          uOpacity: { value: opacity },
        },
      }),
    [opacity, twinkle],
  );
}

function buildGalaxy() {
  const { count, radius, branches, spin, randomness, power } = GALAXY;
  const rng = mulberry32(7);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const inner = new THREE.Color('#ffd8a8');
  const mid = new THREE.Color('#c48bff');
  const outer = new THREE.Color('#4f7dff');
  const c = new THREE.Color();
  const scatter = (r: number) => Math.pow(rng(), power) * (rng() < 0.5 ? 1 : -1) * randomness * r;

  for (let i = 0; i < count; i++) {
    const r = Math.pow(rng(), 1.4) * radius;
    const angle = ((i % branches) / branches) * Math.PI * 2 + r * spin;
    positions[i * 3] = Math.cos(angle) * r + scatter(r + 0.5);
    positions[i * 3 + 1] = scatter(r + 0.5) * 0.35 * (1 - r / radius) + scatter(1) * 0.3;
    positions[i * 3 + 2] = Math.sin(angle) * r + scatter(r + 0.5);

    const t = r / radius;
    if (t < 0.35) c.copy(inner).lerp(mid, t / 0.35);
    else c.copy(mid).lerp(outer, (t - 0.35) / 0.65);
    colors.set([c.r, c.g, c.b], i * 3);
    sizes[i] = 0.4 + rng() * 0.9 + (t < 0.1 ? 1.2 : 0);
    phases[i] = rng() * Math.PI * 2;
  }
  return { positions, colors, sizes, phases };
}

/** Pre-placed civilization sites along the arms; only the first `count` are drawn. */
function buildBeacons() {
  const rng = mulberry32(11);
  const positions = new Float32Array(MAX_BEACONS * 3);
  const colors = new Float32Array(MAX_BEACONS * 3);
  const sizes = new Float32Array(MAX_BEACONS);
  const phases = new Float32Array(MAX_BEACONS);
  const color = new THREE.Color('#7ff8ff');
  for (let i = 0; i < MAX_BEACONS; i++) {
    const r = 1.5 + rng() * (GALAXY.radius - 2);
    const angle = (Math.floor(rng() * GALAXY.branches) / GALAXY.branches) * Math.PI * 2 + r * GALAXY.spin;
    const jitter = () => (rng() - 0.5) * 0.9;
    positions.set([Math.cos(angle) * r + jitter(), jitter() * 0.2, Math.sin(angle) * r + jitter()], i * 3);
    colors.set([color.r, color.g, color.b], i * 3);
    sizes[i] = 1.6 + rng() * 1.2;
    phases[i] = rng() * Math.PI * 2;
  }
  return { positions, colors, sizes, phases };
}

function geometryFrom(data: ReturnType<typeof buildGalaxy>) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
  g.setAttribute('color', new THREE.BufferAttribute(data.colors, 3));
  g.setAttribute('size', new THREE.BufferAttribute(data.sizes, 1));
  g.setAttribute('phase', new THREE.BufferAttribute(data.phases, 1));
  return g;
}

function beaconCount(log10N: number) {
  if (log10N < 0) return 0;
  return Math.min(MAX_BEACONS, Math.round(10 ** log10N));
}

function Galaxy({ log10N, animate }: { log10N: number; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const galaxyGeometry = useMemo(() => geometryFrom(buildGalaxy()), []);
  const beaconGeometry = useMemo(() => {
    const g = geometryFrom(buildBeacons());
    g.setDrawRange(0, 0);
    return g;
  }, []);
  const galaxyMaterial = usePointMaterial(0.55, 0.15);
  const beaconMaterial = usePointMaterial(1, 0.6);
  const shown = useRef(0);
  const target = beaconCount(log10N);

  const earth = useMemo(() => {
    const angle = 1 * (Math.PI / 2) + EARTH_RADIUS * GALAXY.spin;
    return new THREE.Vector3(Math.cos(angle) * EARTH_RADIUS, 0.05, Math.sin(angle) * EARTH_RADIUS);
  }, []);

  useEffect(
    () => () => {
      galaxyGeometry.dispose();
      beaconGeometry.dispose();
      galaxyMaterial.dispose();
      beaconMaterial.dispose();
    },
    [galaxyGeometry, beaconGeometry, galaxyMaterial, beaconMaterial],
  );

  useFrame((state, delta) => {
    timeUniform.value = state.clock.elapsedTime;
    // Beacons fade in/out gradually as N changes.
    shown.current += (target - shown.current) * Math.min(1, delta * 3);
    beaconGeometry.setDrawRange(0, Math.round(shown.current));
    if (animate && group.current) group.current.rotation.y += delta * 0.025;
  });

  return (
    <group ref={group} rotation={[0.45, 0, 0.12]}>
      <points geometry={galaxyGeometry} material={galaxyMaterial} />
      <points geometry={beaconGeometry} material={beaconMaterial} />
      <mesh position={earth}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#7dffa8" />
        <Html center distanceFactor={14} className="earth-label" zIndexRange={[1, 0]}>
          <span>You are here</span>
        </Html>
      </mesh>
    </group>
  );
}

export default function GalaxyScene() {
  const results = useResults();
  const animate = useMemo(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);
  return (
    <div className="galaxy-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 9, 20], fov: 50 }} dpr={[1, 2]} gl={{ antialias: true }}>
        <Starfield animate={animate} />
        <Galaxy log10N={results?.displayLog10N ?? -Infinity} animate={animate} />
      </Canvas>
    </div>
  );
}
