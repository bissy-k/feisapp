import React, { useCallback, useState, useRef } from 'react';
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

function polarToCartesian(center: number, radius: number, angleInDegrees: number) {
  const angleInRadians = angleInDegrees * Math.PI / 180;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians)
  };
}

function describeArc(center: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(center, radius, startAngle);
  const end = polarToCartesian(center, radius, endAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

// Full-circle sweep starting at 12 o'clock. -90° = top in this coordinate
// system (0° = 3 o'clock, 90° = 6 o'clock).
const START_ANGLE = -90;
const SWEEP = 360;

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
  const progress = Math.min(1, Math.max(0, (value - min) / range));
  // Clamp just under a full lap so the arc's start/end points never
  // coincide — an SVG `A` command can't render a true 360° circle.
  const valueAngle = START_ANGLE + Math.min(progress * SWEEP, 359.9);
  const center = size / 2;

  // Layered outside-in: the thick progress ring sits at the rim, a band of
  // tick marks just inside it, then the flat white face at the center.
  const ringStrokeWidth = Math.max(24, size * 0.125);
  const ringRadius = center - ringStrokeWidth / 2 - size * 0.012;
  const ringInnerEdge = ringRadius - ringStrokeWidth / 2;
  const tickOuterRadius = ringInnerEdge - size * 0.02;
  const tickLength = size * 0.032;
  const innerInset = center - (tickOuterRadius - tickLength - size * 0.018);

  const progressPath = describeArc(center, ringRadius, START_ANGLE, valueAngle);
  const railPath = describeArc(center, ringRadius, START_ANGLE, START_ANGLE + 359.9);

  const getAngle = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
  }, []);
  const triggerHaptic = useCallback((duration = 8) => {
    const now = window.performance.now();
    if (now - lastHapticAtRef.current < 45) return;
    lastHapticAtRef.current = now;

    window.dispatchEvent(
      new CustomEvent('feis:haptic', {
        detail: {
          duration,
          style: 'selection'
        }
      })
    );

    if (typeof window.navigator?.vibrate === 'function') {
      window.navigator.vibrate(duration);
      return;
    }

    const maybeNativeWindow = window as Window & {
      webkit?: {
        messageHandlers?: {
          hapticFeedback?: {
            postMessage: (payload: {duration: number; style: string;}) => void;
          };
        };
      };
      Telegram?: {
        WebApp?: {
          HapticFeedback?: {
            selectionChanged?: () => void;
          };
        };
      };
    };

    maybeNativeWindow.webkit?.messageHandlers?.hapticFeedback?.postMessage({
      duration,
      style: 'selection'
    });
    maybeNativeWindow.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.();
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
    // Sensitivity: one full lap of the dial (360°) = full range
    const bpmDelta = delta / SWEEP * range;
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
  // Uniform tick ring, clock-minute spacing.
  const tickCount = 48;
  const ticks = Array.from({ length: tickCount }, (_, i) => i);
  const knob = polarToCartesian(center, ringRadius, valueAngle);

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size,
        filter: isDragging ? `drop-shadow(0 10px 20px ${accentColor}2E)` : 'drop-shadow(0 8px 18px rgba(77, 43, 35, 0.08))'
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

      <svg width={size} height={size} className="absolute inset-0 pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="premiumDialArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F4987F" />
            <stop offset="55%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#C85A45" />
          </linearGradient>
        </defs>

        <path
          d={railPath}
          fill="none"
          stroke="#E4DFDA"
          strokeWidth={ringStrokeWidth}
          strokeLinecap="round" />
        <motion.path
          d={progressPath}
          fill="none"
          stroke="url(#premiumDialArc)"
          strokeWidth={ringStrokeWidth}
          strokeLinecap="round"
          animate={isPlaying ? { strokeWidth: [ringStrokeWidth, isAccent ? ringStrokeWidth + 3 : ringStrokeWidth + 2, ringStrokeWidth] } : { strokeWidth: ringStrokeWidth }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          key={`arc-pulse-${beatPulseKey}`} />

        {/* Tick marks — uniform ring nested inside the progress ring */}
        {ticks.map((i) => {
          const angle = START_ANGLE + i / tickCount * 360;
          const outer = polarToCartesian(center, tickOuterRadius, angle);
          const inner = polarToCartesian(center, tickOuterRadius - tickLength, angle);
          return (
            <line
              key={i}
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              stroke="#8A8580"
              strokeWidth={1.5}
              strokeLinecap="round" />);

        })}
      </svg>

      {isPlaying &&
      <motion.div
        key={`beat-ripple-${beatPulseKey}`}
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: Math.max(0, innerInset - 10),
          border: `1.5px solid ${accentColor}`
        }}
        initial={{ opacity: isAccent ? 0.28 : 0.16, scale: 0.95 }}
        animate={{ opacity: 0, scale: isAccent ? 1.06 : 1.03 }}
        transition={{ duration: isAccent ? 0.4 : 0.3, ease: 'easeOut' }} />
      }

      <motion.div
        className="absolute pointer-events-none rounded-full bg-white"
        style={{
          left: knob.x - 20,
          top: knob.y - 20,
          width: 40,
          height: 40,
          boxShadow: `0 4px 10px rgba(91, 50, 45, 0.18), 0 0 0 1px ${accentColor}33`
        }}
        animate={{
          scale: isDragging ? 1.08 : isPlaying && isAccent ? [1, 1.05, 1] : 1
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }} />

      <motion.div
        className="absolute rounded-full bg-white flex items-center justify-center"
        style={{
          inset: innerInset,
          pointerEvents: 'none',
          boxShadow: '0 2px 8px rgba(78, 54, 47, 0.07)'
        }}
        animate={isPlaying ? { scale: [1, isAccent ? 1.02 : 1.01, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        key={`center-pulse-${beatPulseKey}`}>
        {children}
      </motion.div>
    </div>);
}
