import React from 'react';
import type { ComponentType } from '../types/circuit';

interface ComponentSVGProps {
  type: ComponentType;
  value: number;
  unit: string;
  label: string;
  rotation?: number;
  selected?: boolean;
  /** If true, renders in compact mode for the library sidebar */
  compact?: boolean;
}

const COMP_W = 80;
const COMP_H = 40;

const ComponentSVG: React.FC<ComponentSVGProps> = ({
  type,
  value,
  unit,
  label,
  rotation = 0,
  selected = false,
  compact = false,
}) => {
  const strokeColor = selected ? '#60a5fa' : '#94a3b8';
  const strokeWidth = selected ? 2.5 : 2;

  const renderBody = () => {
    switch (type) {
      case 'resistor':
        return (
          <g>
            <line x1={-40} y1={0} x2={-20} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            <polyline
              points="-20,0 -15,-10 -5,10 5,-10 15,10 20,0"
              fill="none"
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              strokeLinejoin="round"
            />
            <line x1={20} y1={0} x2={40} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'capacitor':
        return (
          <g>
            <line x1={-40} y1={0} x2={-6} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={-6} y1={-14} x2={-6} y2={14} stroke={strokeColor} strokeWidth={strokeWidth + 0.5} />
            <line x1={6} y1={-14} x2={6} y2={14} stroke={strokeColor} strokeWidth={strokeWidth + 0.5} />
            <line x1={6} y1={0} x2={40} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'inductor':
        return (
          <g>
            <line x1={-40} y1={0} x2={-24} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            {[-16, -4, 8, 20].map((cx, i) => (
              <path
                key={i}
                d={`M ${cx - 8} 0 A 8 8 0 0 1 ${cx} -10 A 8 8 0 0 1 ${cx + 8} 0`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            ))}
            <line x1={28} y1={0} x2={40} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'voltage_source':
        return (
          <g>
            <line x1={-40} y1={0} x2={-18} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={0} cy={0} r={18} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <text x={-8} y={5} fontSize={14} fill={strokeColor} fontWeight="bold">+</text>
            <text x={4} y={5} fontSize={14} fill={strokeColor} fontWeight="bold">−</text>
            <line x1={18} y1={0} x2={40} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'current_source':
        return (
          <g>
            <line x1={-40} y1={0} x2={-18} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            <circle cx={0} cy={0} r={18} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            <polygon points="-8,0 4,-7 4,7" fill={strokeColor} />
            <line x1={18} y1={0} x2={40} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'ground':
        return (
          <g>
            <line x1={0} y1={-20} x2={0} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={-18} y1={0} x2={18} y2={0} stroke={strokeColor} strokeWidth={strokeWidth + 0.5} />
            <line x1={-12} y1={7} x2={12} y2={7} stroke={strokeColor} strokeWidth={strokeWidth} />
            <line x1={-6} y1={14} x2={6} y2={14} stroke={strokeColor} strokeWidth={strokeWidth} />
          </g>
        );

      case 'wire':
        return (
          <g>
            <line x1={-30} y1={0} x2={30} y2={0} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray="6 3" />
          </g>
        );

      default:
        return null;
    }
  };

  if (compact) {
    return (
      <svg width={80} height={50} viewBox="-40 -25 80 50">
        {renderBody()}
      </svg>
    );
  }

  const transformStr = `rotate(${rotation})`;

  return (
    <g transform={transformStr}>
      {selected && (
        <rect
          x={-COMP_W / 2 - 6}
          y={-COMP_H / 2 - 6}
          width={COMP_W + 12}
          height={COMP_H + 12}
          rx={4}
          fill="rgba(96,165,250,0.12)"
          stroke="#60a5fa"
          strokeWidth={1}
          strokeDasharray="4 2"
        />
      )}
      {renderBody()}
      {!compact && (
        <text
          x={0}
          y={type === 'ground' ? 30 : -22}
          textAnchor="middle"
          fontSize={11}
          fill="#94a3b8"
        >
          {label} {value !== 0 ? `${value}${unit}` : ''}
        </text>
      )}
    </g>
  );
};

export default ComponentSVG;
