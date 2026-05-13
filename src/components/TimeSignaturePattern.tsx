import React from 'react';
interface TimeSignaturePatternProps {
  signature: string;
  activeBeat?: number;
}
export function TimeSignaturePattern({
  signature,
  activeBeat = -1
}: TimeSignaturePatternProps) {
  let beats = 4;
  let accents = [0];
  if (signature === '4/4') {
    beats = 4;
    accents = [0];
  } else if (signature === '6/8') {
    beats = 6;
    accents = [0, 3];
  } else if (signature === '9/8') {
    beats = 9;
    accents = [0, 3, 6];
  } else if (signature === '3/4') {
    beats = 3;
    accents = [0];
  } else if (signature === '2/4') {
    beats = 2;
    accents = [0];
  } else if (signature === 'Varies') {
    beats = 4;
    accents = [0];
  }
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`Time signature ${signature}`}>
      
      {Array.from({
        length: beats
      }).map((_, i) => {
        const isAccent = accents.includes(i);
        const isActive = activeBeat === i;
        return (
          <div
            key={i}
            className={`rounded-full transition-all duration-150 ${isAccent ? 'w-2 h-2 bg-[#14b8a6]' : 'w-2 h-2 border border-neutral-500 bg-transparent'} ${isActive ? 'scale-150 shadow-[0_0_8px_rgba(20,184,166,0.8)] bg-[#14b8a6] border-none' : ''}`} />);


      })}
    </div>);

}