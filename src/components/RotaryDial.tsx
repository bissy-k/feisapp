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
  const center = size / 2;
  const ringRadius = center - 28;
  const tickRadius = center - 22;
  const progressPath = describeArc(center, ringRadius, -135, valueAngle);
  const railPath = describeArc(center, ringRadius, -135, 135);
  const innerInset = Math.max(46, size * 0.22);
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
  const tickCount = 12;
  const ticks = Array.from({ length: tickCount }, (_, i) => i);
  const knob = polarToCartesian(center, ringRadius, valueAngle);

  return (
    <div
      ref={containerRef}
      className="relative select-none touch-none"
      style={{
        width: size,
        height: size,
        filter: isDragging ? `drop-shadow(0 18px 34px ${accentColor}33)` : 'drop-shadow(0 20px 34px rgba(77, 43, 35, 0.12))'
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
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(246,239,235,0.72))',
          boxShadow: '18px 22px 36px rgba(66, 42, 35, 0.13), -12px -12px 28px rgba(255, 255, 255, 0.95), inset 9px 10px 24px rgba(146, 112, 102, 0.10), inset -10px -10px 22px rgba(255, 255, 255, 0.88)'
        }} />

      <motion.div
        className="absolute rounded-full"
        style={{
          inset: 34,
          background: 'radial-gradient(circle at 42% 34%, #FFFFFF 0%, #FFFDFB 50%, #F2EDEA 100%)',
          boxShadow: 'inset 10px 12px 24px rgba(80, 56, 49, 0.11), inset -14px -16px 26px rgba(255,255,255,0.95), 0 16px 30px rgba(89, 57, 50, 0.10)'
        }}
        animate={isPlaying ? { scale: [1, isAccent ? 1.025 : 1.012, 1] } : { scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        key={beatPulseKey} />

      {isPlaying &&
      <motion.div
        key={`beat-ripple-${beatPulseKey}`}
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: 18,
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 26px ${accentColor}44`
        }}
        initial={{ opacity: isAccent ? 0.32 : 0.2, scale: 0.92 }}
        animate={{ opacity: 0, scale: isAccent ? 1.13 : 1.08 }}
        transition={{ duration: isAccent ? 0.46 : 0.34, ease: 'easeOut' }} />
      }

      <svg width={size} height={size} className="absolute inset-0 pointer-events-none overflow-visible">
        <defs>
          <linearGradient id="premiumDialArc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF9E8D" />
            <stop offset="48%" stopColor={accentColor} />
            <stop offset="100%" stopColor="#D84E70" />
          </linearGradient>
          <filter id="premiumArcShadow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor={accentColor} floodOpacity="0.28" />
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#6F3B34" floodOpacity="0.16" />
          </filter>
        </defs>

        <path
          d={railPath}
          fill="none"
          stroke="#EEE7E4"
          strokeWidth="28"
          strokeLinecap="round" />
        <path
          d={railPath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="20"
          strokeLinecap="round"
          strokeOpacity="0.68" />
        <motion.path
          d={progressPath}
          fill="none"
          stroke="url(#premiumDialArc)"
          strokeWidth="28"
          strokeLinecap="round"
          filter="url(#premiumArcShadow)"
          animate={isPlaying ? { strokeWidth: [28, isAccent ? 34 : 31, 28] } : { strokeWidth: 28 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          key={`arc-pulse-${beatPulseKey}`} />

        {ticks.map((i) => {
          const angle = -135 + i / (tickCount - 1) * 270;
          const point = polarToCartesian(center, tickRadius, angle);
          const isActiveTick = angle <= valueAngle;
          return (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r={i % 3 === 0 ? 3.8 : 2.8}
              fill={isActiveTick ? accentColor : '#5E5552'}
              opacity={isActiveTick ? 0.45 : 0.55} />
          );
        })}
      </svg>

      {isDragging &&
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: `0 0 0 8px ${accentColor}18, 0 18px 42px ${accentColor}33`
        }} />
      }

      <motion.div
        className="absolute pointer-events-none rounded-full bg-white"
        style={{
          left: knob.x - 22,
          top: knob.y - 22,
          width: 44,
          height: 44,
          border: '1px solid rgba(255,255,255,0.9)',
          boxShadow: `0 13px 20px rgba(91, 50, 45, 0.24), 0 3px 4px ${accentColor}66, inset 0 2px 5px rgba(255,255,255,0.95), inset 0 -4px 8px rgba(91,50,45,0.10)`
        }}
        animate={{
          scale: isDragging ? 1.08 : isPlaying && isAccent ? [1, 1.06, 1] : 1
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }} />

      <motion.div
        className="absolute rounded-full bg-white flex items-center justify-center"
        style={{
          inset: innerInset,
          pointerEvents: 'none',
          boxShadow: '0 18px 28px rgba(78, 54, 47, 0.12), inset 0 1px 1px rgba(255,255,255,0.9)'
        }}
        animate={isPlaying ? { scale: [1, isAccent ? 1.035 : 1.018, 1] } : { scale: 1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        key={`center-pulse-${beatPulseKey}`}>
        {children}
      </motion.div>
    </div>);
}
