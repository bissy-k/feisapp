import React, { useEffect, useState, useRef } from 'react';
import {
  ChevronLeft,
  MoreHorizontal,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Check,
  Volume2,
  Music2,
  Activity } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetronome } from '../hooks/useMetronome';
import { useReducedMotion } from '../hooks/useReducedMotion';
interface FeisPrototypeScreenProps {
  onClose: () => void;
}
type SpeedModel = 'slider' | 'preset';
type Tab = 'track' | 'metronome';
const PRESET_SPEEDS = [0.75, 0.9, 1.0, 1.25, 1.5];
const BASE_BPM = 120;
const TRACK_DURATION = 208; // 3:28
const TRACK_TITLE = 'The Banks of the Lee';
const STEMS = [
{
  id: 'melody',
  label: 'Melody'
},
{
  id: 'bass',
  label: 'Bass'
},
{
  id: 'drums',
  label: 'Drums'
},
{
  id: 'percussion',
  label: 'Percussion'
},
{
  id: 'harmony',
  label: 'Harmony'
}] as
const;
export function FeisPrototypeScreen({ onClose }: FeisPrototypeScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const {
    isPlaying: isMetronomePlaying,
    togglePlay: toggleMetronome,
    stop: stopMetronome,
    bpm,
    setBpm,
    currentBeat,
    accentFirstBeat,
    setAccentFirstBeat,
    volume,
    setVolume,
    sound,
    setSound
  } = useMetronome();
  // Test harness: which speed model is active
  const [speedModel, setSpeedModel] = useState<SpeedModel>('slider');
  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('track');
  // Track playback (visual only)
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const [trackTime, setTrackTime] = useState(45);
  // Speed
  const [speed, setSpeed] = useState(1.0);
  const [pendingSpeed, setPendingSpeed] = useState<number | null>(null);
  const [processingState, setProcessingState] = useState<
    'idle' | 'processing' | 'ready'>(
    'idle');
  // Slider feedback toast
  const [showSpeedToast, setShowSpeedToast] = useState(false);
  const speedToastTimerRef = useRef<number | null>(null);
  // Stems
  const [activeStems, setActiveStems] = useState<string[]>([
  'melody',
  'drums',
  'percussion']
  );
  // Metronome on/off in track tab (it's an overlay there)
  const [trackMetronomeEnabled, setTrackMetronomeEnabled] = useState(true);
  // Sync metronome BPM whenever speed changes
  useEffect(() => {
    setBpm(Math.round(BASE_BPM * speed));
  }, [speed, setBpm]);
  // Show "Playing at X" toast when slider is used
  useEffect(() => {
    if (speedModel !== 'slider') return;
    if (speedToastTimerRef.current)
    window.clearTimeout(speedToastTimerRef.current);
    setShowSpeedToast(true);
    speedToastTimerRef.current = window.setTimeout(
      () => setShowSpeedToast(false),
      2000
    );
    return () => {
      if (speedToastTimerRef.current)
      window.clearTimeout(speedToastTimerRef.current);
    };
  }, [speed, speedModel]);
  // Track time simulation
  useEffect(() => {
    if (!isTrackPlaying) return;
    const interval = window.setInterval(() => {
      setTrackTime((t) => {
        const next = t + speed * 0.1;
        if (next >= TRACK_DURATION) {
          setIsTrackPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => window.clearInterval(interval);
  }, [isTrackPlaying, speed]);
  // Stop metronome when leaving the screen
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, [stopMetronome]);
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const handleTogglePlay = () => {
    if (activeTab === 'track') {
      setIsTrackPlaying((p) => !p);
      if (trackMetronomeEnabled) toggleMetronome();
    } else {
      toggleMetronome();
    }
  };
  const handleRestart = () => {
    setTrackTime(0);
    if (isTrackPlaying || isMetronomePlaying) {

      // keep playing from start
    }};
  const handlePresetTap = (preset: number) => {
    if (preset === speed) return;
    setPendingSpeed(preset);
    setProcessingState('processing');
    // Simulate offline audio processing
    window.setTimeout(() => {
      setProcessingState('ready');
    }, 2000);
  };
  const handleConfirmPreset = () => {
    if (pendingSpeed !== null) {
      setSpeed(pendingSpeed);
    }
    setProcessingState('idle');
    setPendingSpeed(null);
  };
  const handleCancelPreset = () => {
    setProcessingState('idle');
    setPendingSpeed(null);
  };
  const toggleStem = (id: string) => {
    setActiveStems((prev) =>
    prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const isAnyPlaying = isMetronomePlaying || isTrackPlaying;
  const beatDurationS = 60 / bpm;
  // Coral accent
  const CORAL = '#FF6B47';
  // BeatPulse component (inline)
  const BeatPulse = ({ size }: {size: 'sm' | 'lg';}) => {
    const baseSize = size === 'sm' ? 60 : 160;
    const isAccent = currentBeat === 0;
    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          width: baseSize,
          height: baseSize
        }}
        aria-label={`Beat indicator, ${bpm} BPM`}>
        
        {/* Outer pulse ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: baseSize,
            height: baseSize,
            backgroundColor: CORAL,
            opacity: 0.2
          }}
          animate={
          !isAnyPlaying ?
          {
            scale: 1,
            opacity: 0.15
          } :
          prefersReducedMotion ?
          {
            opacity: isAccent ? 0.4 : 0.2
          } :
          {
            scale: [1, isAccent ? 1.5 : 1.3, 1],
            opacity: [0.25, 0.4, 0.25]
          }
          }
          transition={{
            duration: beatDurationS,
            ease: 'easeOut',
            repeat: isAnyPlaying ? Infinity : 0,
            repeatType: 'loop'
          }} />
        
        {/* Inner solid circle */}
        <motion.div
          className="rounded-full"
          style={{
            width: baseSize * 0.55,
            height: baseSize * 0.55,
            backgroundColor: CORAL,
            boxShadow: `0 0 ${size === 'lg' ? 30 : 14}px rgba(255,107,71,0.5)`
          }}
          animate={
          !isAnyPlaying ?
          {
            scale: 1
          } :
          prefersReducedMotion ?
          {
            scale: 1,
            opacity: isAccent ? 1 : 0.7
          } :
          {
            scale: [1, isAccent ? 1.2 : 1.1, 1]
          }
          }
          transition={{
            duration: beatDurationS,
            ease: 'easeOut',
            repeat: isAnyPlaying ? Infinity : 0,
            repeatType: 'loop'
          }} />
        
      </div>);

  };
  return (
    <div className="absolute inset-0 z-50 bg-neutral-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-neutral-800">
        <button
          onClick={onClose}
          className="p-2 -ml-2 active:opacity-70 flex items-center gap-1"
          aria-label="Back">
          
          <ChevronLeft size={24} />
          <span className="text-[15px] font-medium">Back</span>
        </button>
        <div className="text-center min-w-0 flex-1 px-2">
          <div className="text-[15px] font-bold truncate">{TRACK_TITLE}</div>
          <div className="text-[11px] text-neutral-500 font-mono">
            {formatTime(trackTime)} / {formatTime(TRACK_DURATION)}
          </div>
        </div>
        <button className="p-2 -mr-2 active:opacity-70" aria-label="Menu">
          <MoreHorizontal size={22} />
        </button>
      </header>

      {/* Test Harness: Speed Model Toggle */}
      <div className="px-4 pt-3 pb-2 bg-neutral-900/40 border-b border-neutral-800">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
          <span>Speed UX Model</span>
          <span className="text-neutral-600">For testing</span>
        </div>
        <div className="bg-neutral-900 p-1 rounded-lg flex">
          <button
            onClick={() => setSpeedModel('slider')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${speedModel === 'slider' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>
            
            A · Live Slider
          </button>
          <button
            onClick={() => setSpeedModel('preset')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${speedModel === 'preset' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>
            
            B · Offline Presets
          </button>
        </div>
      </div>

      {/* Tabs */}
      <nav
        className="flex px-4 pt-3 gap-2 border-b border-neutral-800"
        role="tablist">
        
        {(
        [
        {
          id: 'track',
          label: 'Track'
        },
        {
          id: 'metronome',
          label: 'Metronome Only'
        }] as
        const).
        map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-3 text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-neutral-500'}`}>
              
              {tab.label}
              {isActive &&
              <motion.div
                layoutId="feisActiveTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{
                  backgroundColor: CORAL
                }} />

              }
            </button>);

        })}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-8">
        {/* TRACK TAB */}
        {activeTab === 'track' &&
        <div className="px-4 pt-6 flex flex-col items-center">
            {/* Beat pulse + BPM */}
            <BeatPulse size="sm" />
            <div className="mt-5 text-center">
              <div className="text-4xl font-bold tracking-tighter tabular-nums">
                {bpm}{' '}
                <span className="text-base text-neutral-500 font-medium">
                  BPM
                </span>
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Base 120 · Playing at {speed.toFixed(2)}x
              </div>
            </div>

            {/* Transport */}
            <div className="flex items-center gap-4 mt-6 mb-2">
              <button
              onClick={handleRestart}
              className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center active:bg-neutral-700"
              aria-label="Restart">
              
                <RotateCcw size={20} />
              </button>
              <button
              onClick={handleTogglePlay}
              className="w-16 h-16 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              style={{
                backgroundColor: CORAL
              }}
              aria-label={isAnyPlaying ? 'Pause' : 'Play'}>
              
                {isAnyPlaying ?
              <Pause size={28} fill="currentColor" /> :

              <Play size={28} fill="currentColor" className="ml-1" />
              }
              </button>
              <button
              onClick={handleTogglePlay}
              className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center active:bg-neutral-700"
              aria-label="Pause">
              
                <Pause size={20} fill="currentColor" />
              </button>
            </div>

            {/* Track progress bar */}
            <div className="w-full mt-6">
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                className="h-full rounded-full transition-all duration-100 ease-linear"
                style={{
                  width: `${trackTime / TRACK_DURATION * 100}%`,
                  backgroundColor: CORAL
                }} />
              
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1.5">
                <span>{formatTime(trackTime)}</span>
                <span>-{formatTime(TRACK_DURATION - trackTime)}</span>
              </div>
            </div>

            {/* Speed Control */}
            <SpeedControl
            speedModel={speedModel}
            speed={speed}
            setSpeed={setSpeed}
            onPresetTap={handlePresetTap}
            showToast={showSpeedToast}
            accent={CORAL} />
          

            {/* Metronome Settings */}
            <SettingsPanel
            title="Metronome"
            titleRight={
            <Toggle
              active={trackMetronomeEnabled}
              onChange={setTrackMetronomeEnabled}
              ariaLabel="Toggle metronome"
              accent={CORAL} />

            }>
            
              <Row label="Volume">
                <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 max-w-[160px]"
                style={{
                  accentColor: CORAL
                }}
                aria-label="Metronome volume" />
              
              </Row>
              <Row label="Accent downbeat">
                <Toggle
                active={accentFirstBeat}
                onChange={setAccentFirstBeat}
                ariaLabel="Toggle accent first beat"
                accent={CORAL} />
              
              </Row>
              <Row label="Time signature">
                <span className="text-sm text-neutral-400 font-mono px-3 py-1 rounded-md bg-neutral-800">
                  4/4
                </span>
              </Row>
            </SettingsPanel>

            {/* Stems */}
            <SettingsPanel title="Stems" icon={<Music2 size={14} />}>
              <div className="grid grid-cols-2 gap-2 -mx-1">
                {STEMS.map((stem) => {
                const isOn = activeStems.includes(stem.id);
                return (
                  <button
                    key={stem.id}
                    onClick={() => toggleStem(stem.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors text-left ${isOn ? 'border-[#FF6B47] bg-[#FF6B47]/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-500'}`}
                    aria-pressed={isOn}>
                    
                      <div
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 ${isOn ? 'bg-[#FF6B47]' : 'border border-neutral-600'}`}>
                      
                        {isOn &&
                      <Check
                        size={12}
                        strokeWidth={3}
                        className="text-white" />

                      }
                      </div>
                      {stem.label}
                    </button>);

              })}
              </div>
              <div className="text-[11px] text-neutral-500 mt-3">
                {activeStems.length} of {STEMS.length} active
              </div>
            </SettingsPanel>
          </div>
        }

        {/* METRONOME ONLY TAB */}
        {activeTab === 'metronome' &&
        <div className="px-4 pt-8 flex flex-col items-center">
            {/* Large beat pulse */}
            <BeatPulse size="lg" />

            {/* Big BPM */}
            <div className="mt-8 text-center">
              <div className="text-7xl font-bold tracking-tighter tabular-nums leading-none">
                {bpm}
              </div>
              <div className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                BPM
              </div>
              <div className="text-xs text-neutral-500 mt-2">
                Base 120 · {speed.toFixed(2)}x
              </div>
            </div>

            {/* Speed control */}
            <SpeedControl
            speedModel={speedModel}
            speed={speed}
            setSpeed={setSpeed}
            onPresetTap={handlePresetTap}
            showToast={showSpeedToast}
            accent={CORAL} />
          

            {/* Settings */}
            <SettingsPanel title="Metronome">
              <Row label="Volume">
                <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 max-w-[160px]"
                style={{
                  accentColor: CORAL
                }}
                aria-label="Metronome volume" />
              
              </Row>
              <Row label="Accent downbeat">
                <Toggle
                active={accentFirstBeat}
                onChange={setAccentFirstBeat}
                ariaLabel="Toggle accent first beat"
                accent={CORAL} />
              
              </Row>
              <Row label="Time signature">
                <span className="text-sm text-neutral-400 font-mono px-3 py-1 rounded-md bg-neutral-800">
                  4/4
                </span>
              </Row>
              <Row label="Sound">
                <select
                value={sound}
                onChange={(e) => setSound(e.target.value as any)}
                className="bg-neutral-800 text-sm text-neutral-200 px-3 py-1.5 rounded-md outline-none"
                aria-label="Sound type">
                
                  <option value="beep">Beep</option>
                  <option value="click">Click</option>
                  <option value="woodblock">Woodblock</option>
                </select>
              </Row>
            </SettingsPanel>

            {/* Start / Stop */}
            <div className="w-full grid grid-cols-2 gap-3 mt-2">
              <button
              onClick={() => !isMetronomePlaying && toggleMetronome()}
              disabled={isMetronomePlaying}
              className="h-14 rounded-xl text-white font-bold disabled:opacity-50 active:scale-95 transition-transform"
              style={{
                backgroundColor: CORAL
              }}>
              
                Start
              </button>
              <button
              onClick={() => isMetronomePlaying && toggleMetronome()}
              disabled={!isMetronomePlaying}
              className="h-14 rounded-xl bg-neutral-800 text-white font-bold disabled:opacity-50 active:scale-95 transition-transform">
              
                Stop
              </button>
            </div>
          </div>
        }
      </main>

      {/* Processing Modal (Model B) */}
      <AnimatePresence>
        {processingState !== 'idle' &&
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm z-[60]" />
          
            <motion.div
            initial={{
              y: 30,
              opacity: 0
            }}
            animate={{
              y: 0,
              opacity: 1
            }}
            exit={{
              y: 30,
              opacity: 0
            }}
            className="absolute inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none">
            
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto">
                {processingState === 'processing' ?
              <div className="flex flex-col items-center text-center">
                    <Loader2
                  size={36}
                  className="animate-spin mb-4"
                  style={{
                    color: CORAL
                  }} />
                
                    <div className="text-lg font-bold mb-1">
                      Processing at {pendingSpeed?.toFixed(2)}x
                    </div>
                    <div className="text-sm text-neutral-500">
                      Re-rendering audio at the new tempo…
                    </div>
                  </div> :

              <div className="flex flex-col items-center text-center">
                    <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: CORAL
                  }}>
                  
                      <Check size={24} strokeWidth={3} className="text-white" />
                    </div>
                    <div className="text-lg font-bold mb-1">Ready to play</div>
                    <div className="text-sm text-neutral-500 mb-5">
                      {pendingSpeed?.toFixed(2)}x ·{' '}
                      {Math.round(BASE_BPM * (pendingSpeed ?? 1))} BPM
                    </div>
                    <div className="flex gap-2 w-full">
                      <button
                    onClick={handleCancelPreset}
                    className="flex-1 h-11 rounded-lg bg-neutral-800 text-sm font-semibold active:bg-neutral-700">
                    
                        Cancel
                      </button>
                      <button
                    onClick={handleConfirmPreset}
                    className="flex-1 h-11 rounded-lg text-sm font-semibold text-white active:scale-95 transition-transform"
                    style={{
                      backgroundColor: CORAL
                    }}>
                    
                        Apply
                      </button>
                    </div>
                  </div>
              }
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>

      {/* Live speed toast */}
      <AnimatePresence>
        {showSpeedToast && speedModel === 'slider' &&
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: 20
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[55]">
          
            <div
            className="px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg flex items-center gap-2"
            style={{
              backgroundColor: CORAL
            }}>
            
              <Activity size={14} />
              Playing at {speed.toFixed(2)}x · {bpm} BPM
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}
// ───────── Inline subcomponents ─────────
function SpeedControl({
  speedModel,
  speed,
  setSpeed,
  onPresetTap,
  showToast,
  accent







}: {speedModel: SpeedModel;speed: number;setSpeed: (n: number) => void;onPresetTap: (n: number) => void;showToast: boolean;accent: string;}) {
  return (
    <div className="w-full mt-8">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
          Speed
        </span>
        <span
          className="text-sm font-semibold tabular-nums"
          style={{
            color: accent
          }}>
          
          {speed.toFixed(2)}x
        </span>
      </div>
      {speedModel === 'slider' ?
      <div>
          <input
          type="range"
          min={0.5}
          max={2.0}
          step={0.05}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="w-full"
          style={{
            accentColor: accent
          }}
          aria-label="Speed" />
        
          <div className="flex justify-between text-[10px] text-neutral-500 mt-1 font-mono">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div> :

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
          {PRESET_SPEEDS.map((preset) => {
          const isActive = preset === speed;
          return (
            <button
              key={preset}
              onClick={() => onPresetTap(preset)}
              className={`flex-shrink-0 h-11 px-4 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'bg-neutral-900 border border-neutral-800 text-neutral-300'}`}
              style={
              isActive ?
              {
                backgroundColor: accent
              } :
              undefined
              }>
              
                {preset.toFixed(2)}x
              </button>);

        })}
          <button className="flex-shrink-0 h-11 px-4 rounded-lg text-sm font-semibold bg-neutral-900 border border-neutral-800 text-neutral-400">
            Custom
          </button>
        </div>
      }
    </div>);

}
function SettingsPanel({
  title,
  titleRight,
  icon,
  children





}: {title: string;titleRight?: React.ReactNode;icon?: React.ReactNode;children: React.ReactNode;}) {
  return (
    <section className="w-full mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-neutral-500 font-bold">
          {icon}
          <span>{title}</span>
        </div>
        {titleRight}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>);

}
function Row({
  label,
  children



}: {label: string;children: React.ReactNode;}) {
  return (
    <div className="flex items-center justify-between gap-4 min-h-[36px]">
      <span className="text-sm text-neutral-300">{label}</span>
      {children}
    </div>);

}
function Toggle({
  active,
  onChange,
  ariaLabel,
  accent





}: {active: boolean;onChange: (v: boolean) => void;ariaLabel: string;accent: string;}) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0 ${active ? '' : 'bg-neutral-700'}`}
      style={
      active ?
      {
        backgroundColor: accent
      } :
      undefined
      }
      aria-pressed={active}
      aria-label={ariaLabel}>
      
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${active ? 'left-[22px]' : 'left-0.5'}`} />
      
    </button>);

}