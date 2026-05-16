import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
interface RotaryDialProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  size?: number;
  isPlaying?: boolean;
  beatPulseKey?: number; // changes on each beat to trigger pulse
  isAccent?: boolean;
  children?: React.ReactNode;
  accentColor?: string;
}
/**
 * Drag-to-rotate dial. Drag anywhere on the ring/circle to scrub BPM up or down.
 * Treats vertical AND angular drag as input — most natural for a thumb on phone.
 */
export function RotaryDial({
  value,
  min,
  max,
  step = 1,
  onChange,
  size = 260,
  isPlaying = false,
  isAccent = false,
  beatPulseKey = 0,
  children,
  accentColor = '#E08068'
}: RotaryDialProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const lastHapticAtRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const range = max - min;
  // Map current value to a 270° arc starting at -135° (bottom-left) sweeping to +135° (bottom-right)
  const valueAngle = -135 + (value - min) / range * 270;
  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
  }, []);
  const triggerHaptic = useCallback((duration = 8) => {
    if (typeof window.navigator?.vibrate !== 'function') return;
    const now = window.performance.now();
    if (now - lastHapticAtRef.current < 45) return;
    lastHapticAtRef.current = now;
    window.navigator.vibrate(duration);
  }, []);
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    accumulatedRef.current = 0;
    triggerHaptic(10);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || lastAngleRef.current === null) return;
    const angle = getAngle(e.clientX, e.clientY);
    let delta = angle - lastAngleRef.current;
    // Wrap delta to (-180, 180]
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngleRef.current = angle;
    // Sensitivity: 270° of rotation = full range
    const bpmDelta = delta / 270 * range;
    accumulatedRef.current += bpmDelta;
    if (Math.abs(accumulatedRef.current) >= step) {
      const change = Math.trunc(accumulatedRef.current / step) * step;
      const next = Math.max(min, Math.min(max, value + change));
      if (next !== value) {
        onChange(next);
        triggerHaptic();
      }
      accumulatedRef.current -= change;
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    lastAngleRef.current = null;
    accumulatedRef.current = 0;
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };
  // Generate tick marks
  const tickCount = 60;
  const ticks = Array.from(
    {
      length: tickCount
    },
    (_, i) => i
  );
  const center = size / 2;
  const outerRadius = center - 4;
  const innerTickRadius = outerRadius - 8;
  const longTickRadius = outerRadius - 14;
  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      role="slider"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label="BPM dial — drag to adjust"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
          onChange(Math.min(max, value + step));
          triggerHaptic();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
          onChange(Math.max(min, value - step));
          triggerHaptic();
        }
      }}>
      
      {/* SVG ticks + arc */}
      <svg
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none">
        
        {/* Tick marks */}
        {ticks.map((i) => {
          const angle = i / tickCount * 360 - 90;
          const rad = angle * Math.PI / 180;
          const isMajor = i % 5 === 0;
          const r1 = isMajor ? longTickRadius : innerTickRadius;
          const x1 = center + r1 * Math.cos(rad);
          const y1 = center + r1 * Math.sin(rad);
          const x2 = center + outerRadius * Math.cos(rad);
          const y2 = center + outerRadius * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={accentColor}
              strokeOpacity={isMajor ? 0.35 : 0.15}
              strokeWidth={isMajor ? 1.5 : 1}
              strokeLinecap="round" />);


        })}
      </svg>

      {/* Pulsing accent ring (replaces simple border, animates with beat) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${accentColor}`,
          opacity: 0.4
        }}
        animate={
        isPlaying ?
        {
          scale: [1, isAccent ? 1.05 : 1.025, 1],
          opacity: [0.4, isAccent ? 0.85 : 0.65, 0.4]
        } :
        {
          scale: 1,
          opacity: 0.35
        }
        }
        transition={{
          duration: 0.18,
          ease: 'easeOut'
        }}
        key={beatPulseKey} />
      

      {/* Drag glow when active */}
      {isDragging &&
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 0 8px ${accentColor}22, 0 0 30px ${accentColor}55`
        }} />

      }

      {/* Indicator dot showing current position on the arc */}
      <div
        className="absolute top-1/2 left-1/2 pointer-events-none"
        style={{
          transform: `translate(-50%, -50%) rotate(${valueAngle + 90}deg) translateY(-${outerRadius - 2}px)`,
          transition: isDragging ? 'none' : 'transform 200ms ease-out'
        }}>
        
        <div
          className="w-3 h-3 rounded-full shadow-md"
          style={{
            backgroundColor: accentColor
          }} />
        
      </div>

      {/* Inner content */}
      <div
        className="absolute inset-3 rounded-full bg-white flex items-center justify-center shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
        style={{
          pointerEvents: 'none'
        }}>
        
        {children}
      </div>
    </div>);

}
