import React, { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { useMetronome } from '../hooks/useMetronome';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { TimeSignaturePattern } from '../components/TimeSignaturePattern';
import { DANCE_STYLES } from '../data/mockData';
interface PracticeActiveScreenProps {
  config: any;
  onEnd: (stats: any) => void;
}
export function PracticeActiveScreen({
  config,
  onEnd
}: PracticeActiveScreenProps) {
  const {
    currentTrack,
    isPlaying: isTrackPlaying,
    togglePlayPause: toggleTrackPlay,
    progress,
    currentTime
  } = usePlayer();
  const {
    isPlaying: isMetronomePlaying,
    togglePlay: toggleMetronome,
    bpm,
    setBpm,
    currentBeat
  } = useMetronome();
  const prefersReducedMotion = useReducedMotion();
  const [sessionTime, setSessionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [beatsPlayed, setBeatsPlayed] = useState(0);
  const style = currentTrack ?
  DANCE_STYLES.find((s) => s.id === currentTrack.styleId) :
  null;
  const timeSignature = style?.timeSignature || '4/4';
  // Session timer
  useEffect(() => {
    let interval: any;
    if (!isPaused) {
      interval = setInterval(() => {
        setSessionTime((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused]);
  // Track beats played
  useEffect(() => {
    if (!isPaused && (isTrackPlaying || isMetronomePlaying)) {
      setBeatsPlayed((b) => b + 1);
    }
  }, [currentBeat]);
  // Initial start
  useEffect(() => {
    if (config.mode === 'music' || config.mode === 'both') {
      if (!isTrackPlaying) toggleTrackPlay();
    }
    if (config.mode === 'metronome' || config.mode === 'both') {
      if (!isMetronomePlaying) toggleMetronome();
    }
    // Hide tooltip after 4s
    const t = setTimeout(() => setShowTooltip(false), 4000);
    return () => clearTimeout(t);
  }, []);
  const handlePauseToggle = () => {
    setIsPaused(!isPaused);
    if (config.mode === 'music' || config.mode === 'both') toggleTrackPlay();
    if (config.mode === 'metronome' || config.mode === 'both') toggleMetronome();
  };
  const handleEnd = () => {
    if (isTrackPlaying) toggleTrackPlay();
    if (isMetronomePlaying) toggleMetronome();
    onEnd({
      duration: sessionTime,
      track: currentTrack,
      avgBpm: bpm,
      beatsPlayed,
      mode: config.mode
    });
  };
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const getTempoContext = (currentBpm: number) => {
    if (currentBpm < 100) return '🐢 Slow practice';
    if (currentBpm < 130) return '🎯 Standard tempo';
    if (currentBpm < 160) return '⚡ Fast tempo';
    return '🔥 Competition speed';
  };
  // Animation duration for the ring
  const beatDurationMs = 60000 / bpm;
  const beatDurationS = beatDurationMs / 1000;
  return (
    <div className="absolute inset-0 z-50 bg-neutral-900 text-white flex flex-col">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          {currentTrack &&
          <div
            className="w-8 h-8 rounded-md"
            style={{
              backgroundColor: currentTrack.artworkColor
            }} />

          }
          <div>
            <div className="text-xs font-bold text-[#14b8a6] uppercase tracking-wider">
              Practising
            </div>
            <div className="text-sm font-medium text-neutral-300 truncate max-w-[150px]">
              {currentTrack ? currentTrack.title : 'Metronome Only'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isPaused &&
          <span className="bg-yellow-500/20 text-yellow-500 text-xs font-bold px-2 py-1 rounded-md">
              ⏸ Paused
            </span>
          }
          <span className="font-mono text-sm text-neutral-400">
            {formatTime(sessionTime)}
          </span>

          <div className="relative">
            <motion.button
              onClick={() => setShowMoreMenu(true)}
              className="p-2 bg-neutral-800 rounded-full text-neutral-300 active:bg-neutral-700"
              animate={{
                y: [0, -4, 0]
              }}
              transition={{
                duration: 0.5,
                repeat: 2,
                repeatDelay: 3
              }}
              aria-label="More options">
              
              <MoreHorizontal size={20} />
            </motion.button>
            <AnimatePresence>
              {showTooltip &&
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0
                }}
                className="absolute right-0 top-12 bg-[#14b8a6] text-white text-xs font-bold px-3 py-2 rounded-lg whitespace-nowrap shadow-lg z-50">
                
                  Tap for more options
                  <div className="absolute -top-1 right-3 w-2 h-2 bg-[#14b8a6] rotate-45" />
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* BIG ANIMATED PULSING RING */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-12">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-[#14b8a6]"
            animate={
            isPaused ?
            {
              scale: 1,
              opacity: 0.3
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
              duration: beatDurationS,
              ease: 'easeOut',
              repeat: isPaused ? 0 : Infinity,
              repeatType: 'loop'
            }}
            style={{
              boxShadow:
              currentBeat === 0 && !isPaused ?
              '0 0 40px rgba(20,184,166,0.6)' :
              '0 0 10px rgba(20,184,166,0.2)'
            }} />
          

          <div className="z-10 flex flex-col items-center bg-neutral-900 w-48 h-48 rounded-full justify-center shadow-inner">
            <div className="text-6xl font-bold tracking-tighter text-white mb-1">
              {bpm}
            </div>
            <div className="text-sm font-medium text-neutral-500 mb-3">BPM</div>
            <TimeSignaturePattern
              signature={timeSignature}
              activeBeat={isPaused ? -1 : currentBeat} />
            
          </div>
        </div>

        <div className="text-center mb-10">
          <span className="text-sm font-medium text-neutral-400 bg-neutral-800 px-4 py-2 rounded-full">
            {getTempoContext(bpm)}
          </span>
        </div>

        {/* Progress Bar (if music) */}
        {config.mode !== 'metronome' && currentTrack &&
        <div className="w-full max-w-md mb-10">
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-2">
              <div
              className="h-full bg-[#14b8a6] transition-all duration-100 ease-linear"
              style={{
                width: `${progress * 100}%`
              }} />
            
            </div>
            <div className="flex justify-between text-xs font-mono text-neutral-500">
              <span>{formatTime(currentTime)}</span>
              <span>-{formatTime(currentTrack.duration - currentTime)}</span>
            </div>
          </div>
        }

        {/* Controls */}
        <div className="flex items-center gap-8 mb-8">
          <button
            className="text-neutral-400 active:text-white transition-colors"
            aria-label="Skip backward">
            
            <SkipBack size={32} fill="currentColor" />
          </button>

          <button
            onClick={handlePauseToggle}
            className="w-20 h-20 rounded-full bg-[#14b8a6] text-white flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] active:scale-95 transition-transform"
            aria-label={isPaused ? 'Resume' : 'Pause'}>
            
            {isPaused ?
            <Play size={36} fill="currentColor" className="ml-2" /> :

            <Pause size={36} fill="currentColor" />
            }
          </button>

          <button
            className="text-neutral-400 active:text-white transition-colors"
            aria-label="Skip forward">
            
            <SkipForward size={32} fill="currentColor" />
          </button>
        </div>

        <button
          onClick={handleEnd}
          className="text-neutral-500 text-sm font-medium active:text-white transition-colors mt-auto mb-8">
          
          End Practice
        </button>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused &&
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.9
            }}
            className="absolute inset-0 bg-neutral-900/80 backdrop-blur-sm flex items-center justify-center z-40 p-6">
            
              <div className="bg-neutral-800 p-8 rounded-3xl w-full max-w-sm text-center border border-neutral-700 shadow-2xl">
                <h3 className="text-2xl font-bold mb-2">Paused</h3>
                <p className="text-neutral-400 mb-8">
                  Session time: {formatTime(sessionTime)}
                </p>

                <button
                onClick={handlePauseToggle}
                className="w-full bg-[#14b8a6] text-white h-14 rounded-xl font-bold text-lg mb-4 active:scale-95 transition-transform">
                
                  Resume Practice
                </button>
                <button
                onClick={handleEnd}
                className="w-full bg-neutral-700 text-white h-14 rounded-xl font-bold text-lg active:scale-95 transition-transform">
                
                  End Session
                </button>
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>

      {/* More Menu Bottom Sheet */}
      <AnimatePresence>
        {showMoreMenu &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setShowMoreMenu(false)}
            className="absolute inset-0 bg-black/60 z-50" />
          
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
            className="absolute bottom-0 left-0 right-0 bg-neutral-800 rounded-t-3xl z-50 p-6 pb-10">
            
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Practice Options</h3>
                <button
                onClick={() => setShowMoreMenu(false)}
                className="p-2 bg-neutral-700 rounded-full"
                aria-label="Close menu">
                
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-400">
                      Tempo (BPM)
                    </span>
                    <span className="text-sm font-bold text-[#14b8a6]">
                      {bpm}
                    </span>
                  </div>
                  <input
                  type="range"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-[#14b8a6]"
                  aria-label="Adjust BPM" />
                
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-300">
                    Metronome
                  </span>
                  <button
                  onClick={() => {
                    if (isMetronomePlaying) toggleMetronome();else
                    toggleMetronome();
                  }}
                  className={`w-12 h-7 rounded-full transition-colors relative ${isMetronomePlaying ? 'bg-[#14b8a6]' : 'bg-neutral-600'}`}
                  aria-label="Toggle metronome">
                  
                    <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${isMetronomePlaying ? 'left-6' : 'left-1'}`} />
                  
                  </button>
                </div>

                <div className="pt-4 border-t border-neutral-700">
                  <button
                  onClick={handleEnd}
                  className="w-full py-3 text-red-400 font-bold text-center active:bg-neutral-700 rounded-xl transition-colors">
                  
                    End Practice Session
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </div>);

}
