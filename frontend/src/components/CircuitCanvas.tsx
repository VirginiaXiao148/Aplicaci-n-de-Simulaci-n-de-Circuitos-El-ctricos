import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { Circuit, CircuitComponent, Wire, Position, ComponentType } from '../types/circuit';
import ComponentSVG from './ComponentSVG';

const GRID = 20;
const CANVAS_W = 2400;
const CANVAS_H = 1600;

function snapToGrid(v: number): number {
  return Math.round(v / GRID) * GRID;
}

function getTerminalAbsPos(comp: CircuitComponent, termIdx: number): Position {
  const t = comp.terminals[termIdx];
  const rad = (comp.rotation * Math.PI) / 180;
  const rx = t.position.x * Math.cos(rad) - t.position.y * Math.sin(rad);
  const ry = t.position.x * Math.sin(rad) + t.position.y * Math.cos(rad);
  return { x: comp.position.x + rx, y: comp.position.y + ry };
}

function makeTerminals(type: ComponentType, id: string): CircuitComponent['terminals'] {
  const mkT = (tid: string, x: number, y: number) => ({
    id: `${id}-${tid}`,
    componentId: id,
    position: { x, y },
    connectedWireIds: [] as string[],
  });

  switch (type) {
    case 'resistor':
    case 'capacitor':
    case 'inductor':
      return [mkT('t0', -40, 0), mkT('t1', 40, 0)];
    case 'voltage_source':
    case 'current_source':
      return [mkT('t0', -40, 0), mkT('t1', 40, 0)];
    case 'ground':
      return [mkT('t0', 0, -20)];
    case 'wire':
      return [];
    default:
      return [];
  }
}

interface CircuitCanvasProps {
  circuit: Circuit;
  selectedId: string | null;
  onSelectComponent: (id: string | null) => void;
  onAddComponent: (
    type: ComponentType,
    position: Position,
    defaultValue: number,
    unit: string
  ) => void;
  onMoveComponent: (id: string, position: Position) => void;
  onAddWire: (wire: Wire) => void;
  onDeleteSelected: () => void;
}

const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  selectedId,
  onSelectComponent,
  onAddComponent,
  onMoveComponent,
  onAddWire,
  onDeleteSelected,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Wire drawing state
  const [wireStart, setWireStart] = useState<{ compId: string; termIdx: number; pos: Position } | null>(null);
  const [mousePos, setMousePos] = useState<Position>({ x: 0, y: 0 });

  // Drag state
  const dragRef = useRef<{
    compId: string;
    startMouse: Position;
    startComp: Position;
  } | null>(null);

  // Viewport pan
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1200, h: 700 });
  const isPanning = useRef(false);
  const panStart = useRef<Position>({ x: 0, y: 0 });
  const panVBStart = useRef({ x: 0, y: 0 });

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number): Position => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const rect = svgRef.current.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      return {
        x: (clientX - rect.left) * scaleX + viewBox.x,
        y: (clientY - rect.top) * scaleY + viewBox.y,
      };
    },
    [viewBox]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData('componentType') as ComponentType;
      const defaultValue = parseFloat(e.dataTransfer.getData('defaultValue')) || 0;
      const unit = e.dataTransfer.getData('unit') || '';
      if (!type) return;
      const pt = getSVGPoint(e.clientX, e.clientY);
      onAddComponent(type, { x: snapToGrid(pt.x), y: snapToGrid(pt.y) }, defaultValue, unit);
    },
    [getSVGPoint, onAddComponent]
  );

  const handleTerminalClick = useCallback(
    (e: React.MouseEvent, compId: string, termIdx: number) => {
      e.stopPropagation();
      const comp = circuit.components.find((c) => c.id === compId);
      if (!comp) return;
      const pos = getTerminalAbsPos(comp, termIdx);

      if (!wireStart) {
        setWireStart({ compId, termIdx, pos });
      } else {
        // Complete wire
        if (wireStart.compId === compId && wireStart.termIdx === termIdx) {
          setWireStart(null);
          return;
        }
        const startTerm = circuit.components
          .find((c) => c.id === wireStart.compId)
          ?.terminals[wireStart.termIdx];
        const endTerm = comp.terminals[termIdx];
        if (!startTerm || !endTerm) return;

        const newWire: Wire = {
          id: `wire-${Date.now()}`,
          startTerminalId: startTerm.id,
          endTerminalId: endTerm.id,
          points: [wireStart.pos, pos],
        };
        onAddWire(newWire);
        setWireStart(null);
      }
    },
    [circuit.components, wireStart, onAddWire]
  );

  const handleCompMouseDown = useCallback(
    (e: React.MouseEvent, compId: string) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      onSelectComponent(compId);
      const comp = circuit.components.find((c) => c.id === compId);
      if (!comp) return;
      dragRef.current = {
        compId,
        startMouse: { x: e.clientX, y: e.clientY },
        startComp: { ...comp.position },
      };
    },
    [circuit.components, onSelectComponent]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const pt = getSVGPoint(e.clientX, e.clientY);
      setMousePos(pt);

      // Handle component drag
      if (dragRef.current) {
        const dx = e.clientX - dragRef.current.startMouse.x;
        const dy = e.clientY - dragRef.current.startMouse.y;
        const scaleX = viewBox.w / (svgRef.current?.getBoundingClientRect().width || 1);
        const scaleY = viewBox.h / (svgRef.current?.getBoundingClientRect().height || 1);
        const newX = snapToGrid(dragRef.current.startComp.x + dx * scaleX);
        const newY = snapToGrid(dragRef.current.startComp.y + dy * scaleY);
        onMoveComponent(dragRef.current.compId, { x: newX, y: newY });
        return;
      }

      // Handle panning
      if (isPanning.current) {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const scaleX = viewBox.w / rect.width;
        const scaleY = viewBox.h / rect.height;
        const dx = (e.clientX - panStart.current.x) * scaleX;
        const dy = (e.clientY - panStart.current.y) * scaleY;
        setViewBox((vb) => ({
          ...vb,
          x: Math.max(0, Math.min(CANVAS_W - vb.w, panVBStart.current.x - dx)),
          y: Math.max(0, Math.min(CANVAS_H - vb.h, panVBStart.current.y - dy)),
        }));
      }
    },
    [getSVGPoint, onMoveComponent, viewBox.w, viewBox.h]
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    isPanning.current = false;
  }, []);

  const handleSVGMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.altKey)) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY };
        panVBStart.current = { x: viewBox.x, y: viewBox.y };
        return;
      }
      if (e.button === 0) {
        onSelectComponent(null);
        if (wireStart) setWireStart(null);
      }
    },
    [viewBox.x, viewBox.y, onSelectComponent, wireStart]
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox((vb) => {
      const newW = Math.min(CANVAS_W, Math.max(300, vb.w * factor));
      const newH = Math.min(CANVAS_H, Math.max(200, vb.h * factor));
      return { ...vb, w: newW, h: newH };
    });
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT') onDeleteSelected();
      }
      if (e.key === 'Escape') {
        setWireStart(null);
        onSelectComponent(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onDeleteSelected, onSelectComponent]);

  // Build lookup: terminalId -> absolute position
  const terminalPosMap = new Map<string, Position>();
  circuit.components.forEach((comp) => {
    comp.terminals.forEach((t, idx) => {
      terminalPosMap.set(t.id, getTerminalAbsPos(comp, idx));
    });
  });

  const gridLines = [];
  const gx0 = Math.floor(viewBox.x / GRID) * GRID;
  const gy0 = Math.floor(viewBox.y / GRID) * GRID;
  for (let x = gx0; x < viewBox.x + viewBox.w + GRID; x += GRID) {
    gridLines.push(
      <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={CANVAS_H} stroke="#1e293b" strokeWidth={0.5} />
    );
  }
  for (let y = gy0; y < viewBox.y + viewBox.h + GRID; y += GRID) {
    gridLines.push(
      <line key={`gy${y}`} x1={0} y1={y} x2={CANVAS_W} y2={y} stroke="#1e293b" strokeWidth={0.5} />
    );
  }

  return (
    <svg
      ref={svgRef}
      style={{
        flex: 1,
        background: '#0f172a',
        cursor: wireStart ? 'crosshair' : isPanning.current ? 'grabbing' : 'default',
        display: 'block',
      }}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleSVGMouseDown}
      onWheel={handleWheel}
    >
      {/* Grid */}
      <g>{gridLines}</g>

      {/* Wires */}
      {circuit.wires.map((wire) => {
        const start = terminalPosMap.get(wire.startTerminalId);
        const end = terminalPosMap.get(wire.endTerminalId);
        if (!start || !end) return null;
        const pts = wire.points.length >= 2 ? wire.points : [start, end];
        // Draw with right-angle routing
        const mid = { x: pts[1].x, y: pts[0].y };
        return (
          <polyline
            key={wire.id}
            points={`${pts[0].x},${pts[0].y} ${mid.x},${mid.y} ${pts[1].x},${pts[1].y}`}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}

      {/* Wire being drawn */}
      {wireStart && (
        <line
          x1={wireStart.pos.x}
          y1={wireStart.pos.y}
          x2={mousePos.x}
          y2={mousePos.y}
          stroke="#22d3ee"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.8}
        />
      )}

      {/* Components */}
      {circuit.components.map((comp) => {
        const isSelected = comp.id === selectedId;
        return (
          <g
            key={comp.id}
            transform={`translate(${comp.position.x}, ${comp.position.y})`}
            onMouseDown={(e) => handleCompMouseDown(e, comp.id)}
            style={{ cursor: 'move' }}
          >
            <ComponentSVG
              type={comp.type}
              value={comp.value}
              unit={comp.unit}
              label={comp.label}
              rotation={comp.rotation}
              selected={isSelected}
            />

            {/* Terminals */}
            {comp.terminals.map((t, idx) => {
              const absPos = getTerminalAbsPos(comp, idx);
              const relPos = {
                x: absPos.x - comp.position.x,
                y: absPos.y - comp.position.y,
              };
              const isWireStart =
                wireStart?.compId === comp.id && wireStart?.termIdx === idx;
              return (
                <circle
                  key={t.id}
                  cx={relPos.x}
                  cy={relPos.y}
                  r={5}
                  fill={isWireStart ? '#22d3ee' : '#1e3a5f'}
                  stroke={isWireStart ? '#06b6d4' : '#3b82f6'}
                  strokeWidth={1.5}
                  style={{ cursor: 'crosshair' }}
                  onClick={(e) => handleTerminalClick(e, comp.id, idx)}
                  onMouseEnter={(e) => {
                    (e.target as SVGCircleElement).setAttribute('r', '7');
                    (e.target as SVGCircleElement).setAttribute('fill', '#22d3ee');
                  }}
                  onMouseLeave={(e) => {
                    (e.target as SVGCircleElement).setAttribute('r', '5');
                    (e.target as SVGCircleElement).setAttribute(
                      'fill',
                      isWireStart ? '#22d3ee' : '#1e3a5f'
                    );
                  }}
                />
              );
            })}
          </g>
        );
      })}

      {/* Canvas border hint */}
      <rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="none" stroke="#1e293b" strokeWidth={1} />
    </svg>
  );
};

export { makeTerminals };
export default CircuitCanvas;
