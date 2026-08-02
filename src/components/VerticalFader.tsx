import React, { useEffect, useRef, useState } from 'react';

interface VerticalFaderProps {
  value: number; // 0 to 1
  onChange: (value: number) => void;
  disabled?: boolean;
  accentColor?: string;
  trackColor?: string;
  label: string;
  height?: number;
}

export function VerticalFader({
  value,
  onChange,
  disabled = false,
  accentColor = '#E56D56',
  trackColor = '#E6E1DE',
  label,
  height = 150
}: VerticalFaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    if (!isDragging) setLocalValue(value);
  }, [value, isDragging]);

  const updateFromClientY = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    const next = 1 - y / rect.height;
    setLocalValue(next);
    onChange(next);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateFromClientY(event.clientY);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent) => {
    if (isDragging) updateFromClientY(event.clientY);
  };
  const handlePointerUp = (event: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const step = 0.05;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      onChange(Math.min(1, value + step));
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      onChange(Math.max(0, value - step));
    }
    if (event.key === 'Home') {
      event.preventDefault();
      onChange(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      onChange(1);
    }
  };

  const pct = Math.round(localValue * 100);

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={1}
      aria-valuenow={Number(localValue.toFixed(2))}
      aria-label={label}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-3 rounded-full touch-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        height,
        backgroundColor: trackColor,
        opacity: disabled ? 0.5 : 1
      }}>

      <div
        className="absolute bottom-0 left-0 right-0 rounded-full"
        style={{
          height: `${pct}%`,
          backgroundColor: accentColor
        }} />

      <div
        className={`absolute left-1/2 h-9 w-9 -translate-x-1/2 rounded-2xl bg-white transition-transform ${isDragging ? 'scale-110' : ''}`}
        style={{
          bottom: `calc(${pct}% - 18px)`,
          boxShadow: '0 5px 12px rgba(80, 56, 49, 0.18), 0 1px 2px rgba(80, 56, 49, 0.12)'
        }} />

    </div>);

}
