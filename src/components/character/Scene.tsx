import { ContactShadows } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import Model from './Model';

interface Props {
  reducedMotion: boolean;
  onReady: () => void;
  onCharacterClick: () => void;
  onMiss: () => void;
}

export default function Scene({ reducedMotion, onReady, onCharacterClick, onMiss }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 32, position: [0, 1.62, 6.0], near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 1.08, 0);
        requestAnimationFrame(onReady);
      }}
      onPointerMissed={onMiss}
      style={{ cursor: hovered ? 'pointer' : 'default' }}
      aria-hidden="true"
    >
      {/* 사진의 늦은 오후 햇빛: 반구광 + 따뜻한 직사광, 뒤쪽 림라이트로 검정 옷 윤곽을 살린다 */}
      <hemisphereLight args={['#fff7ec', '#cfeee8', 1.5]} />
      <directionalLight position={[-3, 5, 4]} intensity={2.4} color="#ffd9ad" />
      <directionalLight position={[3, 2.5, -4]} intensity={2.2} color="#c9fff5" />
      <directionalLight position={[4, 1.5, 3]} intensity={0.5} color="#ffffff" />

      <Model
        hovered={hovered && !reducedMotion}
        animate={!reducedMotion}
        onClick={(e) => {
          e.stopPropagation();
          onCharacterClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      />

      <mesh rotation-x={-Math.PI / 2} position-y={0.001}>
        <circleGeometry args={[0.95, 64]} />
        <meshBasicMaterial color="#15b8a6" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      {/* 캐릭터가 제자리에 있으므로 그림자는 한 번만 굽는다 */}
      <ContactShadows frames={1} position={[0, 0.002, 0]} scale={3} blur={2.6} far={2.2} opacity={0.42} resolution={512} />
    </Canvas>
  );
}
