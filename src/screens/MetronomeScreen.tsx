import React from 'react';
import { Play, Pause, Minus, Plus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMetronome } from '../hooks/useMetronome';
import { useTapTempo } from '../hooks/useTapTempo';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { TimeSignaturePattern } from '../components/TimeSignaturePattern';
export function MetronomeScreen() {
  const {
    isPlaying,
    togglePlay,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    accentFirstBeat,
    setAccentFirstBeat,
    currentBeat
  } = useMetronome();
  const { handleTap } = useTapTempo(setBpm);
  const prefersReducedMotion = useReducedMotion();
  const presets = [
  {
    label: 'Reel',
    bpm: 113,
    sig: 4
  },
  {
    label: 'Slip Jig',
    bpm: 113,
    sig: 9
  },
  {
    label: 'Hornpipe',
    bpm: 113,
    sig: 4
  },
  {
    label: 'Treble Jig',
    bpm: 73,
    sig: 6
  }];

  return (
    <div className="h-full overflow-y-auto scrollbar-none pb-32 pt-14 px-4 bg-[#FAFAFA] flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">
        Metronome
      </h1>

      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        {/* Visual Pulse */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-12">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#14b8a6]"
            animate={
            !isPlaying ?
            {
              scale: 1,
              opacity: 0.2
            } :
            prefersReducedMotion ?
            {
              opacity: currentBeat === 0 ? 1 : 0.6
            } :
            {
              scale: [1, currentBeat === 0 ? 1.4 : 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }
            }
            transition={{
              duration: isPlaying ? 60000 / bpm / 1000 : 0,
              ease: 'easeOut',
              repeat: isPlaying ? Infinity : 0,
              repeatType: 'loop'
            }}
            style={{
              boxShadow:
              currentBeat === 0 && isPlaying ?
              '0 0 30px rgba(20,184,166,0.5)' :
              'none'
            }} />
          
          <div className="z-10 flex flex-col items-center bg-white w-32 h-32 rounded-full justify-center shadow-sm border border-neutral-100">
            <TimeSignaturePattern
              signature={`${beatsPerMeasure}/4`}
              activeBeat={isPlaying ? currentBeat : -1} />
            
          </div>
        </div>

        {/* BPM Display */}
        <div className="flex items-center justify-between w-full mb-12 px-4">
          <button
            onClick={() => setBpm((b) => Math.max(40, b - 1))}
            className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center active:bg-neutral-100 transition-colors shadow-sm text-neutral-600">
            
            <Minus size={24} />
          </button>

          <div className="text-center flex-1">
            <div className="text-6xl font-bold tracking-tighter text-neutral-900 mb-1">
              {bpm}
            </div>
            <div className="text-[15px] font-semibold text-neutral-400 uppercase tracking-widest">
              BPM
            </div>
          </div>

          <button
            onClick={() => setBpm((b) => Math.min(250, b + 1))}
            className="w-14 h-14 rounded-full bg-white border border-neutral-200 flex items-center justify-center active:bg-neutral-100 transition-colors shadow-sm text-neutral-600">
            
            <Plus size={24} />
          </button>
        </div>

        {/* Tap Tempo & Play */}
        <div className="flex items-center gap-6 mb-12">
          <button
            onClick={handleTap}
            className="w-16 h-16 rounded-full bg-neutral-100 text-neutral-600 flex flex-col items-center justify-center active:scale-95 transition-transform font-semibold text-[13px]">
            
            <Activity size={20} className="mb-0.5" />
            Tap
          </button>
          <button
            onClick={togglePlay}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all ${isPlaying ? 'bg-neutral-900 text-white' : 'bg-[#14b8a6] text-white'}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}>
            
            {isPlaying ?
            <Pause size={40} fill="currentColor" /> :

            <Play size={40} fill="currentColor" className="ml-2" />
            }
          </button>
          <div className="w-16" /> {/* Spacer to balance Tap button */}
        </div>

        {/* Settings */}
        <div className="w-full bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-100">
            <span className="font-semibold text-[16px] text-neutral-900">
              Time Signature
            </span>
            <select
              value={beatsPerMeasure}
              onChange={(e) => setBeatsPerMeasure(Number(e.target.value))}
              className="bg-neutral-100 text-neutral-900 font-semibold py-1.5 px-3 rounded-lg outline-none">
              
              <option value={4}>4/4</option>
              <option value={6}>6/8</option>
              <option value={9}>9/8</option>
              <option value={3}>3/4</option>
              <option value={2}>2/4</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[16px] text-neutral-900">
              Accent First Beat
            </span>
            <button
              onClick={() => setAccentFirstBeat(!accentFirstBeat)}
              className={`w-12 h-7 rounded-full transition-colors relative ${accentFirstBeat ? 'bg-[#14b8a6]' : 'bg-neutral-200'}`}
              aria-label="Toggle accent first beat">
              
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${accentFirstBeat ? 'left-6' : 'left-1'}`} />
              
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="w-full">
          <div className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider mb-3 px-1">
            Presets
          </div>
          <div className="grid grid-cols-2 gap-3">
            {presets.map((p) =>
            <button
              key={p.label}
              onClick={() => {
                setBpm(p.bpm);
                setBeatsPerMeasure(p.sig);
              }}
              className="bg-white border border-neutral-200 py-3 px-4 rounded-xl flex flex-col items-start active:bg-neutral-50 transition-colors">
              
                <span className="font-semibold text-neutral-900">
                  {p.label}
                </span>
                <span className="text-[13px] text-neutral-500">
                  {p.bpm} BPM
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

}
