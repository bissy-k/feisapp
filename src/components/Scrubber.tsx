import React, { useEffect, useState, useRef } from 'react';
interface ScrubberProps {
  progress: number; // 0 to 1
  duration: number; // in seconds
  onSeek: (progress: number) => void;
}
export function Scrubber({ progress, duration, onSeek }: ScrubberProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localProgress, setLocalProgress] = useState(progress);
  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress);
    }
  }, [progress, isDragging]);
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateProgress(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      updateProgress(e.clientX);
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      onSeek(localProgress);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };
  const updateProgress = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setLocalProgress(x / rect.width);
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const currentTime = localProgress * duration;
  return (
    <div className="w-full flex flex-col gap-2">
      <div
        ref={trackRef}
        className="h-6 flex items-center cursor-pointer relative touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}>
        
        {/* Background Track */}
        <div className="w-full h-1.5 bg-neutral-200 rounded-full overflow-hidden">
          {/* Fill */}
          <div
            className="h-full bg-neutral-800 rounded-full"
            style={{
              width: `${localProgress * 100}%`
            }} />
          
        </div>
        {/* Thumb */}
        <div
          className={`absolute w-4 h-4 bg-white rounded-full shadow-md border border-neutral-200 top-1/2 -translate-y-1/2 -ml-2 transition-transform ${isDragging ? 'scale-125' : ''}`}
          style={{
            left: `${localProgress * 100}%`
          }} />
        
      </div>
      <div className="flex justify-between text-[12px] font-medium text-neutral-500 font-mono">
        <span>{formatTime(currentTime)}</span>
        <span>-{formatTime(duration - currentTime)}</span>
      </div>
    </div>);

}