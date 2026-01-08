
/// <reference types="@react-three/fiber" />
import React, { useMemo, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { DAYS, ROWS } from '../constants';
import { Course, CourseType } from '../types';
import * as THREE from 'three';

interface VoxelProps {
  position: [number, number, number];
  color: string;
  isSSR: boolean;
  opacity: number;
  explosion: number;
  visible: boolean;
}

const Voxel: React.FC<VoxelProps> = ({ position, color, isSSR, opacity, explosion, visible }) => {
  if (!visible) return null;

  const explodedPos: [number, number, number] = [
    position[0] * explosion,
    position[1] * explosion,
    position[2] * explosion,
  ];

  const baseColor = useMemo(() => {
    if (color?.startsWith('#')) return color;

    const colorMap: Record<string, string> = {
      'bg-blue-100': '#60a5fa',
      'bg-indigo-100': '#818cf8',
      'bg-purple-100': '#a78bfa',
      'bg-emerald-100': '#34d399',
      'bg-orange-100': '#fb923c',
      'bg-rose-100': '#fb7185',
      'bg-cyan-100': '#22d3ee',
      'bg-yellow-100': '#facc15',
      'bg-teal-100': '#2dd4bf',
      'bg-lime-100': '#a3e635',
      'bg-fuchsia-100': '#e879f9',
      'bg-gray-100': '#94a3b8',
      'bg-slate-200': '#cbd5e1',
      'bg-red-50': '#fca5a5',
      'bg-pink-100': '#f472b6'
    };
    
    // Attempt to match legacy class names
    const bgPart = color.split(' ').find(c => c.startsWith('bg-')) || color.split(' ')[0];
    return colorMap[bgPart] || '#94a3b8';
  }, [color]);

  return (
    <mesh position={explodedPos} castShadow receiveShadow>
      <boxGeometry args={[0.75, 0.75, 0.75]} />
      <meshStandardMaterial 
        color={baseColor} 
        transparent 
        opacity={opacity} 
        roughness={0.2}
        metalness={0.1}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.75, 0.75, 0.75)]} />
        <lineBasicMaterial color={isSSR ? "#9f1239" : "#475569"} transparent opacity={0.2} />
      </lineSegments>
    </mesh>
  );
};

const AxisLabels: React.FC<{ explosion: number; weekRange: [number, number] }> = ({ explosion, weekRange }) => {
  // 定义原点：左(X) - 上(Y) - 前(Z) 的角落
  // 课程区域约为：
  // X: -3.75 (Mon) 到 3.75 (Sat)
  // Y: 3.75 (Slot 1) 到 -3.75 (Slot 6)
  // Z: 9 (W1) 到 -9 (W16)
  
  // 设定轴原点在包围盒的 "左上角前部"
  const origin = new THREE.Vector3(-4.5, 4.5, 10);
  const axisLength = 9; // 稍微长一点

  return (
    <group scale={[explosion, explosion, explosion]}>
      {/* 
         绘制三条轴线 (Geometry) 
         Line 1: Origin -> Right (X Axis)
         Line 2: Origin -> Down (Y Axis)
         Line 3: Origin -> Back (Z Axis)
      */}
      <line>
         <bufferGeometry attach="geometry" attributes-position={new THREE.Float32BufferAttribute([
            // X轴: 向右
            origin.x, origin.y, origin.z,
            origin.x + 10, origin.y, origin.z,
            // Y轴: 向下
            origin.x, origin.y, origin.z,
            origin.x, origin.y - 10, origin.z,
            // Z轴: 向后 (Z值变小)
            origin.x, origin.y, origin.z,
            origin.x, origin.y, origin.z - 20
         ], 3)} />
         <lineBasicMaterial attach="material" color="#94a3b8" linewidth={2} />
      </line>

      {/* X轴标签：星期 (Mon -> Sat) */}
      {DAYS.map((day, i) => (
        <Html key={`day-${i}`} position={[(i - 2.5) * 1.5, origin.y + 0.5, origin.z]} center>
          <div className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-white/50 px-1 rounded">
            {day.label}
          </div>
        </Html>
      ))}
      
      {/* Y轴标签：节次 (1 -> 6) */}
      {ROWS.map((row, i) => (
        <Html key={`row-${i}`} position={[origin.x - 0.5, (2.5 - i) * 1.5, origin.z]} center>
          <div className="text-[7px] font-black text-slate-500 bg-white/50 px-1 rounded">
            #{i+1}
          </div>
        </Html>
      ))}

      {/* Z轴标签：周数 (W1 -> W16) */}
      {/* 沿着 Z 轴线排列，Z 轴是向内延伸的 (Z值减小) */}
      {Array.from({ length: 16 }, (_, i) => i + 1).map(w => (
        (w >= weekRange[0] && w <= weekRange[1]) && (
          <Html key={`week-${w}`} position={[origin.x, origin.y + 0.5, (8.5 - w) * 1.2]} center>
            <div className={`px-1 rounded text-[6px] font-black border transition-all ${w % 4 === 1 ? 'bg-slate-800 text-white border-slate-800 z-10' : 'bg-white/80 text-slate-400 border-slate-200'}`}>
              W{w}
            </div>
          </Html>
        )
      ))}
    </group>
  );
};

interface Visualization3DProps {
  courses: Course[];
}

const Visualization3D: React.FC<Visualization3DProps> = ({ courses }) => {
  const [explosion, setExplosion] = useState(1.0);
  const [opacity, setOpacity] = useState(0.9);
  const [weekRange, setWeekRange] = useState<[number, number]>([1, 16]);

  const voxels = useMemo(() => {
    const data: any[] = [];
    courses.forEach(course => {
      course.weeks.forEach(week => {
        data.push({
          position: [(course.day - 2.5) * 1.5, (2.5 - course.row) * 1.5, (8.5 - week) * 1.2],
          color: course.color,
          isSSR: course.type === CourseType.SSR,
          week: week
        });
      });
    });
    return data;
  }, [courses]);

  return (
    <div className="h-full w-full flex flex-col gap-2 overflow-hidden">
      <div className="flex-1 bg-[#f8fafc] rounded-xl overflow-hidden relative border border-slate-200 shadow-inner">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">Rendering 3D...</div>}>
          <Canvas shadows dpr={[1, 2]}>
            <color attach="background" args={['#f8fafc']} />
            <PerspectiveCamera makeDefault position={[25, 20, 30]} fov={30} />
            <OrbitControls makeDefault enableDamping dampingFactor={0.1} minDistance={10} maxDistance={60} target={[0,0,0]} />
            
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 20, 20]} intensity={0.8} castShadow />
            <hemisphereLight args={['#ffffff', '#f1f5f9', 0.6]} />

            <group scale={[explosion, explosion, explosion]}>
              {voxels.map((v, i) => (
                <Voxel key={i} {...v} explosion={1} opacity={opacity} visible={v.week >= weekRange[0] && v.week <= weekRange[1]} />
              ))}
            </group>
            
            <AxisLabels explosion={explosion} weekRange={weekRange} />
            
            {/* 底部网格，稍微下移 */}
            <gridHelper args={[60, 30, '#e2e8f0', '#f1f5f9']} position={[0, -10, 0]} />
          </Canvas>
        </Suspense>
        
        <div className="absolute bottom-4 left-4 pointer-events-none">
          <div className="bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-100 shadow-lg text-[8px] font-black text-slate-500 flex gap-4">
             <span>X: MON-SAT</span>
             <span>Y: SLOT 1-6</span>
             <span>Z: WEEK 1-16</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 flex flex-wrap gap-2">
        <div className="flex-1 min-w-[120px] bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 h-10">
          <span className="text-[8px] font-black text-slate-400 uppercase">Explode</span>
          <input type="range" min="1" max="2.0" step="0.01" value={explosion} onChange={(e) => setExplosion(parseFloat(e.target.value))} className="flex-1 h-1 min-w-[50px]" />
        </div>
        <div className="flex-1 min-w-[120px] bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 h-10">
          <span className="text-[8px] font-black text-slate-400 uppercase">Alpha</span>
          <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="flex-1 h-1 min-w-[50px]" />
        </div>
        <div className="w-full sm:w-auto sm:flex-[2] bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm flex items-center gap-2 h-10">
           <span className="text-[8px] font-black text-slate-400 uppercase whitespace-nowrap">W{weekRange[0]}-W{weekRange[1]}</span>
           <div className="flex-1 flex gap-1">
             <input type="range" min="1" max="16" value={weekRange[0]} onChange={(e) => setWeekRange([Math.min(parseInt(e.target.value), weekRange[1]), weekRange[1]])} className="flex-1 h-1 min-w-[40px]" />
             <input type="range" min="1" max="16" value={weekRange[1]} onChange={(e) => setWeekRange([weekRange[0], Math.max(parseInt(e.target.value), weekRange[0])])} className="flex-1 h-1 min-w-[40px]" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Visualization3D;
