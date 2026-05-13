import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  CheckCircle2,
  ChevronUp,
  Lock,
  Unlock,
  Volume2,
  Play } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { useMetronome } from '../hooks/useMetronome';
import { TimeSignaturePattern } from '../components/TimeSignaturePattern';
import { DANCE_STYLES } from '../data/mockData';
interface PracticeSetupScreenProps {
  onClose: () => void;
  onStart: (config: any) => void;
}
export function PracticeSetupScreen({
  onClose,
  onStart
}: PracticeSetupScreenProps) {
  const { currentTrack } = usePlayer();
  const { bpm, setBpm, previewClicks, setBeatsPerMeasure } = useMetronome();
  const [isInfoExpanded, setIsInfoExpanded] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [withMetronome, setWithMetronome] = useState(true);
  const [countIn, setCountIn] = useState<number>(4);
  const [loopSection, setLoopSection] = useState(false);
  const [accentFirst, setAccentFirst] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const style = currentTrack ?
  DANCE_STYLES.find((s) => s.id === currentTrack.styleId) :
  null;
  useEffect(() => {
    if (currentTrack && isLocked) {
      setBpm(currentTrack.bpm);
    }
    if (style) {
      const sig = style.timeSignature;
      if (sig === '6/8') setBeatsPerMeasure(6);else
      if (sig === '9/8') setBeatsPerMeasure(9);else
      if (sig === '3/4') setBeatsPerMeasure(3);else
      if (sig === '2/4') setBeatsPerMeasure(2);else
      setBeatsPerMeasure(4);
    }
  }, [currentTrack, isLocked, style, setBpm, setBeatsPerMeasure]);
  const getTempoContext = (currentBpm: number) => {
    if (currentBpm < 80) return '🐢 Very slow — focused on form';
    if (currentBpm < 100) return '🐢 Slow practice — good for learning';
    if (currentBpm < 130) return '🎯 Standard practice tempo';
    if (currentBpm < 160) return '⚡ Fast tempo — challenging!';
    return '🔥 Competition speed!';
  };
  const handlePreview = () => {
    if (isPreviewing) return;
    setIsPreviewing(true);
    const durationMs = previewClicks(4);
    setTimeout(() => {
      setIsPreviewing(false);
    }, durationMs);
  };
  const handleStart = () => {
    onStart({
      mode: withMetronome ? 'both' : 'music',
      withMetronome,
      countIn,
      loopSection,
      accentFirst,
      bpm
    });
  };
  return (
    <motion.div
      initial={{
        y: '100%'
      }}
      animate={{
        y: 0
      }}
      exit={{
        y: '100%'
      }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }}
      className="absolute inset-0 z-50 bg-neutral-900 text-white flex flex-col overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 sticky top-0 bg-neutral-900/90 backdrop-blur-md z-10">
        <button
          onClick={onClose}
          className="p-2 text-white active:opacity-70"
          aria-label="Close setup">
          
          <ChevronDown size={32} />
        </button>
        <div className="text-[15px] font-semibold text-white tracking-wide">
          Practice Setup
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 px-4 pb-8 flex flex-col gap-6">
        {/* Selected Track Card */}
        {currentTrack &&
        <motion.div
          initial={{
            scale: 0.95,
            opacity: 0
          }}
          animate={{
            scale: 1,
            opacity: 1
          }}
          className="bg-neutral-800 rounded-2xl p-4 border-2 border-[#14b8a6] relative shadow-[0_0_15px_rgba(20,184,166,0.15)]">
          
            <div className="absolute top-3 right-3 text-[#14b8a6]">
              <CheckCircle2
              size={24}
              fill="currentColor"
              className="text-neutral-900" />
            
            </div>
            <div className="flex gap-4 items-center">
              <div
              className="w-16 h-16 rounded-xl shadow-md"
              style={{
                backgroundColor: currentTrack.artworkColor
              }} />
            
              <div className="flex-1 min-w-0 pr-6">
                <h3 className="font-bold text-lg truncate">
                  {currentTrack.title}
                </h3>
                <p className="text-neutral-400 text-sm truncate">
                  {currentTrack.artist}
                </p>
                <p className="text-neutral-500 text-xs mt-1">
                  {style?.name} • {currentTrack.bpm} BPM
                </p>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-[#14b8a6] text-xs font-bold uppercase tracking-wider bg-[#14b8a6]/10 px-3 py-1 rounded-full">
                Selected for practice
              </span>
            </div>
          </motion.div>
        }

        {/* Tune Type Info Panel */}
        {style &&
        <div className="bg-neutral-800 rounded-2xl overflow-hidden">
            <button
            onClick={() => setIsInfoExpanded(!isInfoExpanded)}
            className="w-full p-4 flex items-center justify-between active:bg-neutral-700/50 transition-colors"
            aria-expanded={isInfoExpanded}>
            
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{style.name}</span>
                <span className="text-neutral-500">•</span>
                <span>{style.timeSignature}</span>
                <span className="text-neutral-500">•</span>
                <span>
                  {style.bpmRange[0]}-{style.bpmRange[1]} BPM
                </span>
              </div>
              {isInfoExpanded ?
            <ChevronUp size={20} className="text-neutral-400" /> :

            <ChevronDown size={20} className="text-neutral-400" />
            }
            </button>
            <AnimatePresence>
              {isInfoExpanded &&
            <motion.div
              initial={{
                height: 0,
                opacity: 0
              }}
              animate={{
                height: 'auto',
                opacity: 1
              }}
              exit={{
                height: 0,
                opacity: 0
              }}
              className="px-4 pb-4 text-sm text-neutral-300 border-t border-neutral-700">
              
                  <div className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Type</span>
                      <span className="font-medium">{style.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Time Signature</span>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">
                          {style.timeSignature}
                        </span>
                        <TimeSignaturePattern signature={style.timeSignature} />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Typical BPM</span>
                      <span className="font-medium">
                        {style.bpmRange[0]}–{style.bpmRange[1]}
                      </span>
                    </div>
                    <div className="pt-2 text-neutral-400 leading-relaxed">
                      {style.description}
                    </div>
                  </div>
                </motion.div>
            }
            </AnimatePresence>
          </div>
        }

        {/* Tempo / BPM Section */}
        <div className="bg-neutral-800 rounded-2xl p-5 flex flex-col items-center">
          <div className="text-neutral-400 text-xs font-bold uppercase tracking-widest mb-2">
            Tempo
          </div>
          <div className="text-6xl font-bold tracking-tighter mb-1">{bpm}</div>
          <div className="text-neutral-500 text-sm font-medium mb-6">BPM</div>

          <div className="w-full flex items-center gap-4 mb-6">
            <button
              onClick={() => !isLocked && setBpm((b) => Math.max(60, b - 1))}
              disabled={isLocked}
              className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center disabled:opacity-50 active:scale-95"
              aria-label="Decrease BPM">
              
              -
            </button>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              disabled={isLocked}
              className="flex-1 accent-[#14b8a6] disabled:opacity-50"
              aria-label="BPM slider" />
            
            <button
              onClick={() => !isLocked && setBpm((b) => Math.min(200, b + 1))}
              disabled={isLocked}
              className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center disabled:opacity-50 active:scale-95"
              aria-label="Increase BPM">
              
              +
            </button>
          </div>

          {currentTrack &&
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors w-full justify-center ${isLocked ? 'bg-[#14b8a6]/10 text-[#14b8a6]' : 'bg-yellow-500/10 text-yellow-500'}`}>
            
              {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
              {isLocked ?
            `Synced to track (${currentTrack.bpm} BPM)` :
            `Different from track (${currentTrack.bpm} BPM)`}
            </button>
          }

          <div className="mt-4 text-center">
            <span className="text-sm font-medium text-neutral-300">
              {getTempoContext(bpm)}
            </span>
            {!isLocked &&
            currentTrack &&
            withMetronome &&
            bpm !== currentTrack.bpm &&
            <div className="mt-2 text-xs font-bold text-yellow-500 bg-yellow-500/10 inline-block px-3 py-1 rounded-full">
                  Warning: Beats may drift from track
                </div>
            }
          </div>
        </div>

        {/* Click Track Toggle */}
        <button
          onClick={() => setWithMetronome(!withMetronome)}
          className="bg-neutral-800 rounded-2xl p-4 flex items-center justify-between text-left active:bg-neutral-700/70 transition-colors"
          aria-pressed={withMetronome}>
          
          <div className="flex-1 min-w-0 pr-4">
            <div className="font-semibold text-[15px] text-white mb-0.5">
              Click track
            </div>
            <div className="text-[13px] text-neutral-400">
              {withMetronome ?
              'Metronome plays alongside the music' :
              'Music only — no metronome click'}
            </div>
          </div>
          <div
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${withMetronome ? 'bg-[#14b8a6]' : 'bg-neutral-600'}`}>
            
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${withMetronome ? 'left-6' : 'left-1'}`} />
            
          </div>
        </button>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-800 rounded-xl p-4">
            <div className="text-xs text-neutral-400 font-semibold uppercase mb-3">
              Count-in
            </div>
            <div className="flex bg-neutral-900 rounded-lg p-1">
              {[0, 4, 8].map((val) =>
              <button
                key={val}
                onClick={() => setCountIn(val)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${countIn === val ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>
                
                  {val === 0 ? 'None' : val}
                </button>
              )}
            </div>
          </div>
          <div className="bg-neutral-800 rounded-xl p-4 flex flex-col justify-between">
            <div className="text-xs text-neutral-400 font-semibold uppercase mb-2">
              Accent Beat 1
            </div>
            <button
              onClick={() => setAccentFirst(!accentFirst)}
              className={`w-12 h-7 rounded-full transition-colors relative ${accentFirst ? 'bg-[#14b8a6]' : 'bg-neutral-600'}`}
              aria-label="Toggle accent first beat">
              
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${accentFirst ? 'left-6' : 'left-1'}`} />
              
            </button>
          </div>
        </div>

        {/* Preview Button */}
        <button
          onClick={handlePreview}
          disabled={isPreviewing || !withMetronome}
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-[16px] transition-colors border border-neutral-700 disabled:opacity-50">
          
          {isPreviewing ?
          <>
              <div className="w-3 h-3 bg-[#14b8a6] rounded-full animate-pulse" />
              Playing preview...
            </> :

          <>
              <Volume2 size={20} className="text-[#14b8a6]" />
              Preview Metronome
            </>
          }
        </button>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isPreviewing}
          className="w-full bg-[#14b8a6] text-white h-16 rounded-2xl flex items-center justify-center gap-2 font-bold text-lg active:scale-95 transition-transform shadow-[0_4px_20px_rgba(20,184,166,0.3)] mt-2">
          
          <Play size={24} fill="currentColor" />
          Start Practice
        </button>
      </div>
    </motion.div>);

}