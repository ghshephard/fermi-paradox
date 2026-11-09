import { Stars } from '@react-three/drei';

export function Starfield({ animate }: { animate: boolean }) {
  return (
    <Stars radius={90} depth={60} count={7000} factor={3.5} saturation={0.2} fade speed={animate ? 0.6 : 0} />
  );
}
