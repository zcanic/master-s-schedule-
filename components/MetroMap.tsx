
import React, { useMemo, useEffect, useState } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  Position,
  Handle
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Course } from '../types';

interface MetroMapProps {
  courses: Course[];
}

const LINE_COLORS = [
  '#edcf3b', // Line 1 (Mon)
  '#00679e', // Line 2 (Tue)
  '#e89e47', // Line 3 (Wed)
  '#01824a', // Line 4 (Thu)
  '#c70541', // Line 5 (Fri)
  '#6e0346', // Line 6 (Sat)
  '#9dd32d', // Line 7 (Sun)
];

const LINE_NAMES = ['1号线', '2号线', '3号线', '4号线', '5号线', '6号线', '7号线'];

// --- Custom Station Node (Vertical Layout) ---
const StationNode = ({ data }: { data: { label: string; color?: string } }) => {
  const isHex = data.color?.startsWith('#');
  
  return (
    <div 
      className="relative w-[200px] h-[60px] bg-white border-4 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
      style={{ borderColor: isHex ? data.color : '#0f172a' }}
    >
      {/* Handles: Top (Target) */}
      {LINE_COLORS.map((_, i) => (
        <Handle
          key={`t-${i}`}
          type="target"
          position={Position.Top}
          id={`t-${i}`}
          style={{ left: `${15 + i * 11.5}%`, opacity: 0 }} 
        />
      ))}

      {/* Content */}
      <div 
        className="text-xs font-black text-center leading-tight px-4 z-10 select-none bg-white/90 backdrop-blur-sm rounded-lg py-1 max-w-[180px] break-words"
        style={{ color: isHex ? data.color : '#1e293b' }}
      >
        {data.label}
      </div>

      {/* Handles: Bottom (Source) */}
      {LINE_COLORS.map((_, i) => (
        <Handle
          key={`s-${i}`}
          type="source"
          position={Position.Bottom}
          id={`s-${i}`}
          style={{ left: `${15 + i * 11.5}%`, opacity: 0 }}
        />
      ))}
    </div>
  );
};

const nodeTypes = { station: StationNode };

// --- Layout Logic (TB) ---
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ 
    rankdir: direction,
    ranksep: 100, // Vertical spacing between ranks
    nodesep: 80,  // Horizontal spacing between nodes
    ranker: 'longest-path' 
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 100, 
        y: nodeWithPosition.y - 30,
      },
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
    };
  });

  return { nodes: layoutNodes, edges };
};

const MetroMap: React.FC<MetroMapProps> = ({ courses }) => {
  const [isLegendOpen, setIsLegendOpen] = useState(true);
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodesMap = new Map<string, Node>();
    const edgesMap = new Map<string, Edge>();
    const getNodeId = (name: string) => `node-${name}`;

    // Create Nodes
    courses.forEach(c => {
        const id = getNodeId(c.name);
        if (!nodesMap.has(id)) {
            nodesMap.set(id, {
                id,
                type: 'station',
                data: { label: c.name, color: c.color },
                position: { x: 0, y: 0 },
            });
        }
    });

    // Create Edges (Lines)
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const dayCourses = courses.filter(c => c.day === dayIdx);
        if (dayCourses.length === 0) continue;

        const color = LINE_COLORS[dayIdx];

        // Simulate weekly flow
        for (let w = 1; w <= 16; w++) {
           const weekCourses = dayCourses
              .filter(c => c.weeks.includes(w))
              .sort((a,b) => a.row - b.row);
           
           if (weekCourses.length < 2) continue;

           for (let i = 0; i < weekCourses.length - 1; i++) {
              const src = weekCourses[i];
              const dst = weekCourses[i+1];
              const srcId = getNodeId(src.name);
              const dstId = getNodeId(dst.name);
              
              if (srcId === dstId) continue; 

              const edgeId = `${srcId}-${dstId}-Line${dayIdx}`;

              // Only Add Edge if not exists
              if (!edgesMap.has(edgeId)) {
                  edgesMap.set(edgeId, {
                      id: edgeId,
                      source: srcId,
                      target: dstId,
                      sourceHandle: `s-${dayIdx}`, 
                      targetHandle: `t-${dayIdx}`, 
                      type: 'smoothstep',
                      animated: false,
                      pathOptions: { borderRadius: 40 },
                      style: { stroke: color, strokeWidth: 6, strokeLinecap: 'round' },
                      interactionWidth: 20, 
                      data: { line: dayIdx }
                  });
              }
           }
        }
    }

    const _nodes = Array.from(nodesMap.values());
    const _edges = Array.from(edgesMap.values());

    const layouted = getLayoutedElements(_nodes, _edges, 'TB');
    return { initialNodes: layouted.nodes, initialEdges: layouted.edges };
  }, [courses]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
     setNodes(initialNodes);
     setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  return (
    <div className="w-full h-full bg-slate-50 relative rounded-xl overflow-hidden border border-slate-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
      >
        <Controls position="bottom-left" className="!m-4" /> 
        <Background gap={24} color="#cbd5e1" variant={undefined} />
        
        {/* Legend - Top Left */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[160px] z-20 transition-all duration-300">
           <div 
             className="flex items-center justify-between cursor-pointer"
             onClick={() => setIsLegendOpen(!isLegendOpen)}
           >
             <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Metro Lines</h4>
             <div className="text-slate-400 text-xs font-bold">{isLegendOpen ? '−' : '+'}</div>
           </div>
           
           <div className={`overflow-hidden transition-all duration-300 ${isLegendOpen ? 'max-h-[300px] mt-3 border-t border-slate-100 pt-2 opacity-100' : 'max-h-0 mt-0 opacity-0'}`}>
             <div className="space-y-2">
               {LINE_NAMES.map((name, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-8 h-1.5 rounded-full shadow-sm" style={{ background: LINE_COLORS[i] }}></div>
                   <span className="text-[10px] font-bold text-slate-600">{name} ({['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]})</span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </ReactFlow>
    </div>
  );
};

export default MetroMap;
