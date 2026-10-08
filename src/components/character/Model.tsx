import { RoundedBox } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useRef } from 'react';
import { DoubleSide, MathUtils, MeshStandardMaterial, Quaternion, Vector3, type Group } from 'three';

// 원본 사진의 착장: 검정 오버핏 반팔 티(왼쪽 가슴 흰 패치), 검정 와이드 바지, 흰 밑창 검정 운동화,
// 브이 한 손목에 검정 시계. 캐릭터는 +z(카메라)를 본다. 캐릭터 오른쪽 = -x(화면 왼쪽)
const mat = (color: string, roughness = 0.85) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
const M = {
  tee: mat('#2b2b30'),
  pants: mat('#1e1e22'),
  shoe: mat('#222226', 0.7),
  sole: mat('#f4f2ee', 0.6),
  skin: mat('#f6d6c0', 0.6),
  hair: new MeshStandardMaterial({ color: '#3b2a22', roughness: 0.55, side: DoubleSide }),
  feature: mat('#3a2520', 0.5),
  blush: new MeshStandardMaterial({ color: '#ff8e8e', transparent: true, opacity: 0.45, depthWrite: false }),
  white: mat('#f7f7f5', 0.7),
  watch: mat('#141416', 0.4),
};

type Vec = [number, number, number];
const UP = new Vector3(0, 1, 0);

/** from → to를 잇는 캡슐(팔·손가락) 또는 실린더(소매) */
function Segment({
  from,
  to,
  radius,
  radiusEnd,
  material,
  cylinder = false,
}: {
  from: Vec;
  to: Vec;
  radius: number;
  radiusEnd?: number;
  material: MeshStandardMaterial;
  cylinder?: boolean;
}) {
  const a = new Vector3(...from);
  const dir = new Vector3(...to).sub(a);
  const length = dir.length();
  const position = a.addScaledVector(dir, 0.5);
  const quaternion = new Quaternion().setFromUnitVectors(UP, dir.normalize());
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      {cylinder ? (
        <cylinderGeometry args={[radius, radiusEnd ?? radius, length, 28]} />
      ) : (
        <capsuleGeometry args={[radius, length, 8, 20]} />
      )}
    </mesh>
  );
}

const HEAD_Y = 1.84;
const HEAD_R = 0.43;

function Face({ eyesRef }: { eyesRef: React.RefObject<Group | null> }) {
  return (
    <group>
      {/* 웃는 눈(∩) — 깜빡일 때 eyesRef의 y 스케일을 줄인다 */}
      <group ref={eyesRef} position={[0, 0.0, 0]}>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.145, 0, 0.405]} rotation={[0, s * 0.34, 0]} material={M.feature}>
            <torusGeometry args={[0.046, 0.014, 10, 28, Math.PI]} />
          </mesh>
        ))}
      </group>
      {/* 눈썹 */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * 0.15, 0.115, 0.392]}
          rotation={[0, s * 0.36, Math.PI / 2 + s * 0.12]}
          material={M.feature}
        >
          <capsuleGeometry args={[0.012, 0.06, 4, 10]} />
        </mesh>
      ))}
      {/* 코 */}
      <mesh position={[0, -0.045, 0.43]} material={M.skin}>
        <sphereGeometry args={[0.022, 16, 12]} />
      </mesh>
      {/* 웃는 입(∪) */}
      <mesh position={[0, -0.105, 0.413]} rotation={[0.18, 0, Math.PI]} material={M.feature}>
        <torusGeometry args={[0.05, 0.013, 10, 28, Math.PI]} />
      </mesh>
      {/* 양볼 홍조 */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.245, -0.07, 0.352]} rotation={[0, s * 0.62, 0]} material={M.blush}>
          <circleGeometry args={[0.055, 24]} />
        </mesh>
      ))}
    </group>
  );
}

function Hair() {
  return (
    <group>
      {/* 뒷머리·옆머리: 위쪽 구 껍질을 앞으로 기울여 뒤쪽이 더 내려오게 */}
      <mesh position={[0, 0.03, -0.035]} rotation-x={0.38} material={M.hair}>
        <sphereGeometry args={[0.458, 48, 32, 0, Math.PI * 2, 0, 1.95]} />
      </mesh>
      {/* 내린 앞머리 */}
      <mesh position={[0, 0.0, 0.0]} material={M.hair}>
        <sphereGeometry args={[0.446, 48, 24, Math.PI / 2 - 1.3, 2.6, 0, 1.16]} />
      </mesh>
    </group>
  );
}

/** 브이 손. wrist를 기준으로 손바닥이 카메라를 본다 */
function VHand({ handRef }: { handRef: React.RefObject<Group | null> }) {
  return (
    <group ref={handRef} position={[-0.6, 1.34, 0.24]} rotation={[0, 0, 0.12]}>
      <mesh position={[0, 0.06, 0]} scale={[1, 1.05, 0.72]} material={M.skin}>
        <sphereGeometry args={[0.078, 24, 18]} />
      </mesh>
      <Segment from={[-0.022, 0.1, 0.01]} to={[-0.06, 0.235, 0.01]} radius={0.024} material={M.skin} />
      <Segment from={[0.022, 0.1, 0.01]} to={[0.05, 0.24, 0.01]} radius={0.024} material={M.skin} />
      {/* 접은 엄지 */}
      <mesh position={[0.05, 0.05, 0.05]} material={M.skin}>
        <sphereGeometry args={[0.03, 16, 12]} />
      </mesh>
    </group>
  );
}

interface ModelProps {
  hovered: boolean;
  animate: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: () => void;
}

export default function Model({ hovered, animate, ...events }: ModelProps) {
  const root = useRef<Group>(null);
  const upper = useRef<Group>(null);
  const head = useRef<Group>(null);
  const eyes = useRef<Group>(null);
  const hand = useRef<Group>(null);

  useFrame(({ clock }, delta) => {
    const scale = MathUtils.damp(root.current!.scale.x, hovered ? 1.03 : 1, 10, delta);
    root.current!.scale.setScalar(scale);
    if (!animate) return;

    const t = clock.elapsedTime;
    // 숨쉬기
    upper.current!.position.y = Math.sin(t * 1.8) * 0.008;
    upper.current!.scale.set(1 + Math.sin(t * 1.8) * 0.006, 1, 1 + Math.sin(t * 1.8) * 0.006);
    // 고개를 살짝 갸웃
    head.current!.rotation.z = Math.sin(t * 0.7) * 0.035;
    head.current!.rotation.y = Math.sin(t * 0.45) * 0.06;
    // 3.8초마다 깜빡임
    const phase = t % 3.8;
    eyes.current!.scale.y = phase < 0.13 ? 0.2 : 1;
    // 브이 손을 살짝 흔듦
    hand.current!.rotation.z = 0.12 + Math.sin(t * 2.2) * 0.06;
  });

  return (
    <group ref={root} {...events}>
      {/* 운동화 */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.16, 0, 0.05]} rotation-y={s * 0.08}>
          <RoundedBox args={[0.25, 0.06, 0.4]} radius={0.028} position-y={0.03} material={M.sole} />
          <RoundedBox args={[0.23, 0.12, 0.36]} radius={0.055} position={[0, 0.1, -0.01]} material={M.shoe} />
        </group>
      ))}

      {/* 와이드 바지 */}
      {[-1, 1].map((s) => (
        <Segment
          key={s}
          from={[s * 0.155, 0.13, 0.02]}
          to={[s * 0.15, 0.78, 0]}
          radius={0.135}
          radiusEnd={0.145}
          material={M.pants}
          cylinder
        />
      ))}
      <RoundedBox args={[0.6, 0.22, 0.38]} radius={0.1} position-y={0.76} material={M.pants} />

      <group ref={upper}>
        {/* 오버핏 티셔츠 */}
        <RoundedBox args={[0.82, 0.68, 0.46]} radius={0.16} smoothness={6} position-y={1.08} material={M.tee} />
        {/* 왼쪽 가슴 흰 로고 패치 */}
        <RoundedBox args={[0.12, 0.075, 0.012]} radius={0.006} position={[0.19, 1.24, 0.232]} material={M.white} />
        {/* 목 */}
        <Segment from={[0, 1.36, 0]} to={[0, 1.5, 0]} radius={0.075} material={M.skin} />

        {/* 소매 — 오버핏이라 넓고 팔꿈치 위까지 */}
        <Segment from={[0.32, 1.3, 0]} to={[0.5, 1.02, 0.02]} radius={0.13} radiusEnd={0.15} material={M.tee} cylinder />
        <Segment from={[-0.32, 1.3, 0]} to={[-0.52, 1.04, 0.04]} radius={0.13} radiusEnd={0.15} material={M.tee} cylinder />

        {/* 왼팔(화면 오른쪽): 자연스럽게 내림 */}
        <Segment from={[0.49, 1.05, 0.02]} to={[0.53, 0.72, 0.07]} radius={0.066} material={M.skin} />
        <mesh position={[0.535, 0.65, 0.08]} scale={[0.9, 1.1, 0.8]} material={M.skin}>
          <sphereGeometry args={[0.078, 20, 16]} />
        </mesh>

        {/* 오른팔(화면 왼쪽): 팔꿈치를 굽혀 브이 */}
        <Segment from={[-0.51, 1.06, 0.04]} to={[-0.6, 0.98, 0.16]} radius={0.066} material={M.skin} />
        <Segment from={[-0.6, 0.98, 0.16]} to={[-0.6, 1.33, 0.24]} radius={0.064} material={M.skin} />
        {/* 시계 */}
        <Segment from={[-0.6, 1.22, 0.215]} to={[-0.6, 1.29, 0.23]} radius={0.074} material={M.watch} cylinder />
        <VHand handRef={hand} />

        {/* 머리 */}
        <group ref={head} position-y={HEAD_Y}>
          <mesh material={M.skin}>
            <sphereGeometry args={[HEAD_R, 48, 36]} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.415, -0.02, 0.02]} scale={[0.6, 1, 0.8]} material={M.skin}>
              <sphereGeometry args={[0.075, 16, 12]} />
            </mesh>
          ))}
          <Hair />
          <Face eyesRef={eyes} />
        </group>
      </group>
    </group>
  );
}
