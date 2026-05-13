import React from 'react';
import { DanceStyle } from '../data/mockData';
interface StyleCardProps {
  style: DanceStyle;
  onClick: () => void;
}
export function StyleCard({ style, onClick }: StyleCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-sm"
      style={{
        backgroundColor: style.color
      }}>
      
      {/* Subtle overlay pattern/gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/20 mix-blend-overlay" />

      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        <h3 className="text-white font-bold text-xl leading-tight tracking-tight drop-shadow-sm">
          {style.name}
        </h3>

        <div className="flex flex-col gap-1">
          <span className="text-white/90 text-xs font-medium bg-black/20 self-start px-2 py-1 rounded-md backdrop-blur-sm">
            {style.bpmRange[0]}-{style.bpmRange[1]} BPM
          </span>
          <span className="text-white/80 text-xs font-medium">
            {style.timeSignature} • {style.shoeType}
          </span>
        </div>
      </div>
    </div>);

}