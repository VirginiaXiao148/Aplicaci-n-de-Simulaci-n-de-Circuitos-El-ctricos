import React, { useRef, useEffect, useCallback } from 'react';

/** Size of each element square in pixels */
const ELEMENT_SIZE = 60;

/** Corner radius for each element rectangle */
const ELEMENT_BORDER_RADIUS = 6;

/** Canvas background colour */
const CANVAS_BG = '#0d0d1a';

/** Colours used to fill each element type */
const ELEMENT_COLORS = {
  resistor: '#e8a838',
  capacitor: '#38a8e8',
  inductor: '#a838e8',
  voltage_source: '#38e87a',
  current_source: '#e83838',
  ground: '#888888',
};

/** Labels rendered inside each square */
const ELEMENT_LABELS = {
  resistor: 'R',
  capacitor: 'C',
  inductor: 'L',
  voltage_source: 'V',
  current_source: 'I',
  ground: 'GND',
};

/**
 * Draw all circuit elements onto the canvas context.
 */
function drawElements(ctx, elements, dragId) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Background
  ctx.fillStyle = CANVAS_BG;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  elements.forEach((el) => {
    const { x, y } = el.position;
    const color = ELEMENT_COLORS[el.type] ?? '#cccccc';
    const label = ELEMENT_LABELS[el.type] ?? el.type;
    const isDragging = el.id === dragId;

    // Shadow for dragged element
    if (isDragging) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 16;
    } else {
      ctx.shadowBlur = 0;
    }

    // Rectangle
    ctx.fillStyle = color;
    ctx.globalAlpha = isDragging ? 0.85 : 1;
    ctx.beginPath();
    ctx.roundRect(x, y, ELEMENT_SIZE, ELEMENT_SIZE, ELEMENT_BORDER_RADIUS);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#ffffff44';
    ctx.lineWidth = isDragging ? 2 : 1;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + ELEMENT_SIZE / 2, y + ELEMENT_SIZE / 2);
  });
}

/**
 * Return the topmost element whose bounding box contains (px, py), or null.
 */
function hitTest(elements, px, py) {
  for (let i = elements.length - 1; i >= 0; i--) {
    const { x, y } = elements[i].position;
    if (px >= x && px <= x + ELEMENT_SIZE && py >= y && py <= y + ELEMENT_SIZE) {
      return elements[i];
    }
  }
  return null;
}

/**
 * CircuitCanvas – renders an interactive HTML5 Canvas where circuit elements
 * (represented as coloured squares) can be dragged freely around the board.
 *
 * Props:
 *   elements        – array of circuit element objects { id, type, position: {x,y}, … }
 *   onSelect        – callback(element) when an element is clicked
 *   onUpdateElement – callback(id, { position }) when an element is moved
 */
function CircuitCanvas({ elements = [], onSelect, onUpdateElement }) {
  const canvasRef = useRef(null);
  const dragRef = useRef(null); // { id, offsetX, offsetY }

  // Redraw whenever elements change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    drawElements(ctx, elements, dragRef.current?.id ?? null);
  }, [elements]);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback((e) => {
    const { x, y } = getPos(e);
    const hit = hitTest(elements, x, y);
    if (hit) {
      dragRef.current = {
        id: hit.id,
        offsetX: x - hit.position.x,
        offsetY: y - hit.position.y,
      };
      // Redraw to show drag highlight
      const ctx = canvasRef.current.getContext('2d');
      drawElements(ctx, elements, hit.id);
    }
  }, [elements, getPos]);

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    const { x, y } = getPos(e);
    const newX = x - dragRef.current.offsetX;
    const newY = y - dragRef.current.offsetY;
    if (onUpdateElement) {
      onUpdateElement(dragRef.current.id, { position: { x: newX, y: newY } });
    }
  }, [getPos, onUpdateElement]);

  const handleMouseUp = useCallback((e) => {
    if (!dragRef.current) return;
    const { x, y } = getPos(e);
    const drag = dragRef.current;
    dragRef.current = null;

    // If the mouse barely moved, treat it as a click/select
    const el = elements.find((el) => el.id === drag.id);
    if (el && onSelect) {
      const dx = x - (el.position.x + ELEMENT_SIZE / 2);
      const dy = y - (el.position.y + ELEMENT_SIZE / 2);
      if (Math.sqrt(dx * dx + dy * dy) < 5) {
        onSelect(el);
      }
    }

    // Remove drag highlight
    const ctx = canvasRef.current.getContext('2d');
    drawElements(ctx, elements, null);
  }, [elements, getPos, onSelect]);

  const handleMouseLeave = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    const ctx = canvasRef.current.getContext('2d');
    drawElements(ctx, elements, null);
  }, [elements]);

  return (
    <canvas
      ref={canvasRef}
      className="circuit-canvas"
      width={900}
      height={600}
      style={{ background: CANVAS_BG, border: '1px solid #333', cursor: 'default', display: 'block', width: '100%' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
}

export default CircuitCanvas;
