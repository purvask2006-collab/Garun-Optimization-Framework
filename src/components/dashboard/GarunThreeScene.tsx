import React, { useRef, useEffect, Suspense, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Activity, Flame, Cpu, BatteryCharging, Disc } from 'lucide-react';
import { CameraPreset } from './SubsystemHighlighter';

// ============================================================================
// 3D SUB-COMPONENTS FOR DIGITAL TWIN
// ============================================================================

// 1. Animated Turboshaft Gas Core Engine
const TurboshaftCore: React.FC<{
  position: [number, number, number];
  isSimRunning: boolean;
  simSpeed: number;
  onClick: () => void;
  isSelected: boolean;
}> = ({ position, isSimRunning, simSpeed, onClick, isSelected }) => {
  const compressorRef = useRef<THREE.Group>(null);
  const turbineRef = useRef<THREE.Group>(null);
  const exhaustGlowRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const speedFactor = isSimRunning ? simSpeed : 0.05;
    if (compressorRef.current) {
      compressorRef.current.rotation.z += delta * 20 * speedFactor;
    }
    if (turbineRef.current) {
      turbineRef.current.rotation.z += delta * 25 * speedFactor;
    }
    if (exhaustGlowRef.current) {
      const mat = exhaustGlowRef.current.material;
      const m = Array.isArray(mat) ? mat[0] : mat;
      if (m && 'opacity' in m) {
        (m as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(state.clock.elapsedTime * 8) * 0.25;
      }
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer Combustion Chamber Nacelle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.42, 1.2, 24]} />
        <meshStandardMaterial 
          color={isSelected ? '#00A8FF' : '#334155'} 
          metalness={0.9} 
          roughness={0.2} 
          transparent 
          opacity={0.8}
        />
      </mesh>

      {/* Compressor Rotor Disks */}
      <group ref={compressorRef} position={[0, 0, 0.3]}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <boxGeometry args={[0.7, 0.04, 0.02]} />
            <meshStandardMaterial color="#00A8FF" metalness={0.9} />
          </mesh>
        ))}
      </group>

      {/* High-Pressure Turbine Stage */}
      <group ref={turbineRef} position={[0, 0, -0.3]}>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 4]}>
            <boxGeometry args={[0.65, 0.05, 0.02]} />
            <meshStandardMaterial color="#FF6B35" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Exhaust Heat Flame Cone */}
      <mesh ref={exhaustGlowRef} position={[0, 0, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.32, 0.7, 16]} />
        <meshBasicMaterial color="#FF3300" transparent opacity={0.7} />
      </mesh>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.02, 16, 32]} />
          <meshBasicMaterial color="#00F5E4" />
        </mesh>
      )}
    </group>
  );
};

// 2. Animated High-Speed Generator
const HighSpeedGenerator: React.FC<{
  position: [number, number, number];
  isSimRunning: boolean;
  simSpeed: number;
  onClick: () => void;
  isSelected: boolean;
}> = ({ position, isSimRunning, simSpeed, onClick, isSelected }) => {
  const rotorRef = useRef<THREE.Group>(null);
  const arcRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const speedFactor = isSimRunning ? simSpeed : 0.05;
    if (rotorRef.current) {
      rotorRef.current.rotation.z += delta * 30 * speedFactor;
    }
    if (arcRingRef.current) {
      arcRingRef.current.rotation.z -= delta * 15 * speedFactor;
      const mat = arcRingRef.current.material;
      const m = Array.isArray(mat) ? mat[0] : mat;
      if (m && 'opacity' in m) {
        (m as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(state.clock.elapsedTime * 12) * 0.3;
      }
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Stator Housing */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.7, 20]} />
        <meshStandardMaterial color={isSelected ? '#00E87A' : '#1E293B'} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Electromagnetic Coils */}
      <mesh ref={arcRingRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.03, 16, 32]} />
        <meshBasicMaterial color="#00E87A" transparent opacity={0.8} />
      </mesh>

      {/* Rotating Rotor Armature Shaft */}
      <group ref={rotorRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 12]} />
          <meshStandardMaterial color="#FFB800" metalness={0.9} />
        </mesh>
        {[...Array(4)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
            <boxGeometry args={[0.45, 0.08, 0.5]} />
            <meshStandardMaterial color="#00E87A" emissive="#00E87A" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.02, 16, 32]} />
          <meshBasicMaterial color="#00E87A" />
        </mesh>
      )}
    </group>
  );
};

// 3. Animated Li-Sulfur Battery Pack with Battery Glow
const BatteryPackModule: React.FC<{
  position: [number, number, number];
  socPct: number;
  isSimRunning: boolean;
  onClick: () => void;
  isSelected: boolean;
}> = ({ position, socPct, isSimRunning, onClick, isSelected }) => {
  const glowMeshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (glowMeshRef.current) {
      const mat = glowMeshRef.current.material;
      const m = Array.isArray(mat) ? mat[0] : mat;
      if (m && 'emissiveIntensity' in m) {
        const pulse = isSimRunning ? Math.sin(state.clock.elapsedTime * 5) * 0.3 : 0;
        (m as THREE.MeshStandardMaterial).emissiveIntensity = 0.6 + pulse;
      }
    }
  });

  const glowColor = socPct > 50 ? '#00E87A' : socPct > 20 ? '#FFB800' : '#FF3B30';

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Outer Protective Casing */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.9, 0.25, 1.2]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} transparent opacity={0.85} />
      </mesh>

      {/* Battery Cell Blocks Grid */}
      <group position={[0, 0, 0]}>
        {[-0.25, 0, 0.25].map((x, xi) =>
          [-0.35, 0, 0.35].map((z, zi) => (
            <mesh key={`${xi}-${zi}`} position={[x, 0, z]}>
              <boxGeometry args={[0.2, 0.2, 0.25]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} />
            </mesh>
          ))
        )}
      </group>

      {/* Glowing Energy Core Mesh (Battery Glow) */}
      <mesh ref={glowMeshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.82, 0.22, 1.12]} />
        <meshStandardMaterial 
          color={glowColor} 
          emissive={glowColor} 
          emissiveIntensity={0.8} 
          transparent 
          opacity={0.4} 
        />
      </mesh>

      {/* Selection Box */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.96, 0.3, 1.26]} />
          <meshBasicMaterial color="#00F5E4" wireframe />
        </mesh>
      )}
    </group>
  );
};

// 4. Animated Electric Traction Motor
const ElectricMotor: React.FC<{
  position: [number, number, number];
  isSimRunning: boolean;
  simSpeed: number;
  onClick: () => void;
  isSelected: boolean;
}> = ({ position, isSimRunning, simSpeed, onClick, isSelected }) => {
  const statorFieldRef = useRef<THREE.Mesh>(null);
  const rotorShaftRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const speedFactor = isSimRunning ? simSpeed : 0.05;
    if (rotorShaftRef.current) {
      rotorShaftRef.current.rotation.z += delta * 24 * speedFactor;
    }
    if (statorFieldRef.current) {
      const mat = statorFieldRef.current.material;
      const m = Array.isArray(mat) ? mat[0] : mat;
      if (m && 'opacity' in m) {
        (m as THREE.MeshBasicMaterial).opacity = 0.4 + Math.sin(state.clock.elapsedTime * 10) * 0.3;
      }
    }
  });

  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick(); }}>
      {/* Motor Stator Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.6, 20]} />
        <meshStandardMaterial color={isSelected ? '#00A8FF' : '#1E293B'} metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Electromagnetic Pulse Field Ring */}
      <mesh ref={statorFieldRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.02, 16, 32]} />
        <meshBasicMaterial color="#00A8FF" transparent opacity={0.6} />
      </mesh>

      {/* Inner Traction Rotor Shaft */}
      <group ref={rotorShaftRef}>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} rotation={[0, 0, (i * Math.PI) / 3]}>
            <boxGeometry args={[0.42, 0.06, 0.45]} />
            <meshStandardMaterial color="#00A8FF" emissive="#00A8FF" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.44, 0.02, 16, 32]} />
          <meshBasicMaterial color="#00A8FF" />
        </mesh>
      )}
    </group>
  );
};

// 5. Contra-Rotating Propeller
const ContraRotatingPropeller: React.FC<{
  position: [number, number, number];
  isSimRunning: boolean;
  simSpeed: number;
}> = ({ position, isSimRunning, simSpeed }) => {
  const prop1Ref = useRef<THREE.Group>(null);
  const prop2Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const speedFactor = isSimRunning ? simSpeed : 0.05;
    if (prop1Ref.current) {
      prop1Ref.current.rotation.z += delta * 35 * speedFactor;
    }
    if (prop2Ref.current) {
      prop2Ref.current.rotation.z -= delta * 35 * speedFactor;
    }
  });

  return (
    <group position={position}>
      {/* Front Spinner Nosecone */}
      <mesh position={[0, 0, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.5, 16]} />
        <meshStandardMaterial color="#0F172A" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Front Propeller Stage (Clockwise) */}
      <group ref={prop1Ref} position={[0, 0, 0.1]}>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[2.2, 0.12, 0.02]} />
            <meshStandardMaterial color="#00A8FF" metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Rear Propeller Stage (Counter-Clockwise) */}
      <group ref={prop2Ref} position={[0, 0, -0.1]}>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => (
          <mesh key={i} rotation={[0, 0, angle + Math.PI / 3]}>
            <boxGeometry args={[2.0, 0.12, 0.02]} />
            <meshStandardMaterial color="#00F5E4" metalness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// 6. Power Flow Particle Streams (Mechanical Flow & Electrical Flow)
const PowerFlowAnimation: React.FC<{
  isSimRunning: boolean;
  showFlows: boolean;
}> = ({ isSimRunning, showFlows }) => {
  const mechParticlesRef = useRef<THREE.Group>(null);
  const elecParticlesRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!showFlows) return;
    const speed = isSimRunning ? 1.5 : 0.2;

    if (mechParticlesRef.current) {
      mechParticlesRef.current.children.forEach((child) => {
        child.position.z -= delta * speed * 1.8;
        if (child.position.z < -2.8) child.position.z = -1.3;
      });
    }

    if (elecParticlesRef.current) {
      elecParticlesRef.current.children.forEach((child, idx) => {
        child.position.z += delta * speed * 2.0;
        if (child.position.z > 2.0) child.position.z = -1.2;
        child.position.y = (child.userData.baseY || 0) + Math.sin(state.clock.elapsedTime * 15 + idx) * 0.02;
      });
    }
  });

  if (!showFlows) return null;

  return (
    <group>
      <group ref={mechParticlesRef}>
        {[...Array(12)].map((_, i) => (
          <mesh key={`mech-${i}`} position={[0, 0, -1.3 - i * 0.12]}>
            <sphereGeometry args={[0.035, 8, 8]} />
            <meshBasicMaterial color="#FF6B35" />
          </mesh>
        ))}
      </group>

      <group ref={elecParticlesRef}>
        {[...Array(18)].map((_, i) => {
          const zPos = -1.2 + i * 0.18;
          const xOffset = i % 2 === 0 ? 0.25 : -0.25;
          return (
            <mesh 
              key={`elec-${i}`} 
              position={[xOffset, 0.15, zPos]}
              userData={{ baseY: 0.15 }}
            >
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#00E87A" />
            </mesh>
          );
        })}
      </group>

      <mesh position={[0.25, 0.15, -0.45]}>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
        <meshBasicMaterial color="#00E87A" transparent opacity={0.6} />
      </mesh>
      <mesh position={[-0.25, 0.15, 1.15]}>
        <cylinderGeometry args={[0.012, 0.012, 1.7, 8]} />
        <meshBasicMaterial color="#00F5E4" transparent opacity={0.6} />
      </mesh>
    </group>
  );
};

// 7. Tactical Aircraft Hull Model
const AircraftAirframeHull: React.FC<{
  showHull: boolean;
}> = ({ showHull }) => {
  if (!showHull) return null;

  return (
    <group>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.68, 5.2, 24]} />
        <meshStandardMaterial 
          color="#0F172A" 
          metalness={0.8} 
          roughness={0.2} 
          transparent={true} 
          opacity={0.3} 
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.425, 0.685, 5.2, 16]} />
        <meshStandardMaterial color="#00A8FF" wireframe opacity={0.25} transparent />
      </mesh>

      <mesh position={[0, 0.1, 3.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.42, 1.2, 16]} />
        <meshStandardMaterial color="#00F5E4" transparent opacity={0.35} metalness={0.9} />
      </mesh>

      <mesh position={[0, -0.05, 0.2]}>
        <boxGeometry args={[6.8, 0.04, 1.6]} />
        <meshStandardMaterial color="#1E293B" transparent opacity={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.05, 0.2]}>
        <boxGeometry args={[6.81, 0.045, 1.61]} />
        <meshStandardMaterial color="#00A8FF" wireframe opacity={0.2} transparent />
      </mesh>

      <group position={[-0.8, 0.5, -2.2]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.04, 1.2, 0.8]} />
        <meshStandardMaterial color="#00F5E4" transparent opacity={0.35} />
      </group>
      <group position={[0.8, 0.5, -2.2]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.04, 1.2, 0.8]} />
        <meshStandardMaterial color="#00F5E4" transparent opacity={0.35} />
      </group>
    </group>
  );
};

// 8. Dynamic Camera Controller for View Presets
const CameraRig: React.FC<{ cameraPreset: CameraPreset }> = ({ cameraPreset }) => {
  const { camera } = useThree();

  useEffect(() => {
    switch (cameraPreset) {
      case 'ISO':
        camera.position.set(4.5, 3.2, 5.0);
        break;
      case 'TOP':
        camera.position.set(0, 8.5, 0.01);
        break;
      case 'SIDE':
        camera.position.set(7.5, 0.5, 0);
        break;
      case 'ENGINE_XRAY':
        camera.position.set(2.2, 1.2, -1.8);
        break;
      case 'BATTERY_XRAY':
        camera.position.set(1.8, 1.5, 0.5);
        break;
    }
    camera.lookAt(0, 0, 0);
  }, [cameraPreset, camera]);

  return null;
};

// ============================================================================
// CANVAS ERROR BOUNDARY & FALLBACK
// ============================================================================
class ThreeCanvasErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Canvas 3D Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const Fallback2DSchematic: React.FC<{
  selectedCompId: string;
  setSelectedCompId: (id: string) => void;
  isSimRunning: boolean;
}> = ({ selectedCompId, setSelectedCompId, isSimRunning }) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#070C18] relative p-4 font-mono-data text-xs">
    <div className="absolute top-3 left-3 text-[10px] text-[#00A8FF] flex items-center space-x-1 bg-[#111A2E] px-2 py-1 rounded border border-[#1A2740]">
      <Activity className="w-3 h-3 text-[#00A8FF] animate-pulse" />
      <span>2D TACTICAL SCHEMATIC VIEW</span>
    </div>
    
    <div className="w-full max-w-xl h-48 border border-[#1A2740] rounded bg-[#0A0F1E] p-4 flex items-center justify-between relative overflow-hidden my-auto">
      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#FFB800] via-[#00A8FF] to-[#00E87A] opacity-60 pointer-events-none" />
      
      <button
        onClick={() => setSelectedCompId('turboshaft')}
        className={`z-10 flex flex-col items-center p-2 rounded border transition-all ${
          selectedCompId === 'turboshaft'
            ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800] scale-105 shadow-lg'
            : 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE] hover:border-[#FFB800]/50'
        }`}
      >
        <Flame className={`w-6 h-6 ${isSimRunning ? 'animate-pulse text-[#FFB800]' : ''}`} />
        <span className="text-[10px] font-bold mt-1">TURBOSHAFT</span>
        <span className="text-[8px] opacity-75">110 kW</span>
      </button>

      <button
        onClick={() => setSelectedCompId('generator')}
        className={`z-10 flex flex-col items-center p-2 rounded border transition-all ${
          selectedCompId === 'generator'
            ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] scale-105 shadow-lg'
            : 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE] hover:border-[#00A8FF]/50'
        }`}
      >
        <Cpu className="w-6 h-6" />
        <span className="text-[10px] font-bold mt-1">GENERATOR</span>
        <span className="text-[8px] opacity-75">105 kW</span>
      </button>

      <button
        onClick={() => setSelectedCompId('battery')}
        className={`z-10 flex flex-col items-center p-2 rounded border transition-all ${
          selectedCompId === 'battery'
            ? 'bg-[#00E87A]/20 border-[#00E87A] text-[#00E87A] scale-105 shadow-lg'
            : 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE] hover:border-[#00E87A]/50'
        }`}
      >
        <BatteryCharging className="w-6 h-6 text-[#00E87A]" />
        <span className="text-[10px] font-bold mt-1">LI-S BATTERY</span>
        <span className="text-[8px] opacity-75">78.4% SOC</span>
      </button>

      <button
        onClick={() => setSelectedCompId('motor')}
        className={`z-10 flex flex-col items-center p-2 rounded border transition-all ${
          selectedCompId === 'motor'
            ? 'bg-[#00A8FF]/20 border-[#00A8FF] text-[#00A8FF] scale-105 shadow-lg'
            : 'bg-[#111A2E] border-[#1A2740] text-[#8A9BBE] hover:border-[#00A8FF]/50'
        }`}
      >
        <Disc className={`w-6 h-6 ${isSimRunning ? 'animate-spin text-[#00A8FF]' : ''}`} />
        <span className="text-[10px] font-bold mt-1">ELECTRIC MOTOR</span>
        <span className="text-[8px] opacity-75">95 kW</span>
      </button>
    </div>
  </div>
);

export interface GarunThreeSceneProps {
  cameraPreset: CameraPreset;
  selectedCompId: string;
  setSelectedCompId: (id: string) => void;
  isSimRunning: boolean;
  simSpeed: number;
  showHull: boolean;
  showFlows: boolean;
  showGrid: boolean;
  batterySocPct: number;
}

export const GarunThreeScene: React.FC<GarunThreeSceneProps> = ({
  cameraPreset,
  selectedCompId,
  setSelectedCompId,
  isSimRunning,
  simSpeed,
  showHull,
  showFlows,
  showGrid,
  batterySocPct
}) => {
  return (
    <ThreeCanvasErrorBoundary
      fallback={
        <Fallback2DSchematic
          selectedCompId={selectedCompId}
          setSelectedCompId={setSelectedCompId}
          isSimRunning={isSimRunning}
        />
      }
    >
      <Canvas camera={{ position: [4.5, 3.2, 5.0], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 15, 10]} intensity={1.2} color="#00A8FF" />
          <pointLight position={[-10, -10, -10]} intensity={0.6} color="#FF6B35" />

          <CameraRig cameraPreset={cameraPreset} />

          <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.3}>
            <AircraftAirframeHull showHull={showHull} />

            <TurboshaftCore 
              position={[0, 0, -2.1]} 
              isSimRunning={isSimRunning} 
              simSpeed={simSpeed}
              onClick={() => setSelectedCompId('turboshaft')}
              isSelected={selectedCompId === 'turboshaft'}
            />

            <HighSpeedGenerator 
              position={[0, 0, -1.2]} 
              isSimRunning={isSimRunning} 
              simSpeed={simSpeed}
              onClick={() => setSelectedCompId('generator')}
              isSelected={selectedCompId === 'generator'}
            />

            <BatteryPackModule 
              position={[0, -0.2, 0.3]} 
              socPct={batterySocPct}
              isSimRunning={isSimRunning}
              onClick={() => setSelectedCompId('battery')}
              isSelected={selectedCompId === 'battery'}
            />

            <ElectricMotor 
              position={[0, 0, 1.8]} 
              isSimRunning={isSimRunning} 
              simSpeed={simSpeed}
              onClick={() => setSelectedCompId('motor')}
              isSelected={selectedCompId === 'motor'}
            />

            <ContraRotatingPropeller 
              position={[0, 0, 3.1]} 
              isSimRunning={isSimRunning} 
              simSpeed={simSpeed} 
            />

            <PowerFlowAnimation isSimRunning={isSimRunning} showFlows={showFlows} />
          </Float>

          {showGrid && (
            <gridHelper args={[24, 24, '#00A8FF', '#111827']} position={[0, -2.2, 0]} />
          )}

          <OrbitControls enableZoom={true} autoRotate={false} maxPolarAngle={Math.PI / 1.8} />
        </Suspense>
      </Canvas>
    </ThreeCanvasErrorBoundary>
  );
};
