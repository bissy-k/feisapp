import React, { useEffect, useRef, useState } from 'react';

interface TrackScrubberProps {
  progress: number; // 0 to 1
  onSeek?: (progress: number) => void;
  accentColor?: string;
  trackColor?: string;
  height?: number; // touch-target height
}

const THUMB_SIZE = 10;

export function TrackScrubber({
  progress,
  onSeek,
  accentColor = '#E56D56',
  trackColor = '#F8E1DB',
  height = 24
}: TrackScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    if (!isDragging) setLocalProgress(progress);
  }, [progress, isDragging]);

  const updateFromClientX = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setLocalProgress(rect.width > 0 ? x / rect.width : 0);
  };
  const handlePointerDown = (event: React.PointerEvent) => {
    if (!onSeek) return;
    setIsDragging(true);
    updateFromClientX(event.clientX);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  };
  const handlePointerMove = (event: React.PointerEvent) => {
    if (isDragging) updateFromClientX(event.clientX);
  };
  const handlePointerUp = (event: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      onSeek?.(localProgress);
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    }
  };

  const pct = Math.max(0, Math.min(1, localProgress)) * 100;

  return (
    <div
      ref={trackRef}
      role={onSeek ? 'slider' : undefined}
      tabIndex={onSeek ? 0 : undefined}
      aria-orientation={onSeek ? 'horizontal' : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 1 : undefined}
      aria-valuenow={onSeek ? Number(localProgress.toFixed(2)) : undefined}
      aria-label={onSeek ? 'Seek' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative flex-1 flex items-center ${onSeek ? 'cursor-pointer touch-none' : ''}`}
      style={{ height }}>

      <div className="w-full h-[5px] rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <div
          className={`h-full rounded-full ${isDragging ? '' : 'transition-all duration-100 ease-linear'}`}
          style={{ width: `${pct}%`, backgroundColor: accentColor }} />

      </div>
      {onSeek &&
      <div
        className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white transition-transform ${isDragging ? 'scale-125' : ''}`}
        style={{
          left: `calc(${pct}% - ${THUMB_SIZE / 2}px)`,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          border: `1.5px solid ${accentColor}`,
          boxShadow: '0 1px 3px rgba(80, 56, 49, 0.3)'
        }} />
      }
    </div>);

}
