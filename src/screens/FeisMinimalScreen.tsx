import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMetronome } from '../hooks/useMetronome';
import { usePlayer } from '../context/PlayerContext';
import { RotaryDial } from '../components/RotaryDial';
import { DANCE_STYLES, Track } from '../data/mockData';

interface FeisMinimalScreenProps {
  onClose?: () => void;
  embedded?: boolean;
}

type PracticePreset = {
  id: string;
  name: string;
  bpm: number;
  bpmRange: [number, number];
  timeSignature: string;
  accentFirstBeat: boolean;
};

type DownloadedTrack = Track & {
  stem: string;
  isDownloaded: true;
};

type DownloadedPlaylist = {
  id: string;
  name: string;
  count: number;
  coverColor: string;
  trackIds: string[];
};

type PracticeSelection =
  | { type: 'preset'; presetId: string }
  | { type: 'track'; trackId: string };

type SelectionView = 'root' | 'playlists' | 'tracks';

const ACCENT = '#E08068';
const BG = '#FBF3EE';
const CARD_BG = '#FFFFFF';

const PRACTICE_PRESETS: PracticePreset[] = [
  {
    id: 'reel',
    name: 'Reel',
    bpm: 113,
    bpmRange: [112, 116],
    timeSignature: '4/4',
    accentFirstBeat: false
  },
  {
    id: 'light-jig',
    name: 'Light Jig',
    bpm: 116,
    bpmRange: [115, 116],
    timeSignature: '6/8',
    accentFirstBeat: false
  },
  {
    id: 'slip-jig',
    name: 'Slip Jig',
    bpm: 113,
    bpmRange: [112, 114],
    timeSignature: '9/8',
    accentFirstBeat: false
  },
  {
    id: 'treble-jig',
    name: 'Treble Jig',
    bpm: 73,
    bpmRange: [72, 74],
    timeSignature: '6/8',
    accentFirstBeat: false
  },
  {
    id: 'hornpipe',
    name: 'Hornpipe',
    bpm: 113,
    bpmRange: [112, 114],
    timeSignature: '4/4',
    accentFirstBeat: false
  },
  {
    id: 'set-dance',
    name: 'Set Dance',
    bpm: 100,
    bpmRange: [66, 110],
    timeSignature: 'Varies',
    accentFirstBeat: false
  },
  {
    id: 'traditional-set',
    name: 'Traditional Set',
    bpm: 110,
    bpmRange: [90, 130],
    timeSignature: 'Varies',
    accentFirstBeat: false
  }
];

const DOWNLOADED_TRACKS: DownloadedTrack[] = [
  {
    id: 'd1',
    title: 'Small Stepper Set',
    artist: "Anton & Sully",
    styleId: 'hornpipe',
    bpm: 113,
    duration: 194,
    artworkColor: '#F39A3D',
    stem: 'Drums',
    isDownloaded: true
  },
  {
    id: 'd2',
    title: 'Double Trouble Set',
    artist: "Sean O'Brien",
    styleId: 'reel',
    bpm: 113,
    duration: 208,
    artworkColor: '#E05D4F',
    stem: 'Drums',
    isDownloaded: true
  },
  {
    id: 'd3',
    title: 'Another Song',
    artist: "Anton & Sully",
    styleId: 'light-jig',
    bpm: 116,
    duration: 182,
    artworkColor: '#D7A40D',
    stem: 'Full mix',
    isDownloaded: true
  },
  {
    id: 'd4',
    title: "My Mind Will Ne'er Be Easy",
    artist: "Anton & Sully",
    styleId: 'slip-jig',
    bpm: 113,
    duration: 216,
    artworkColor: '#D33F74',
    stem: 'Drums',
    isDownloaded: true
  },
  {
    id: 'd5',
    title: 'Dever the Dancer Set',
    artist: "Anton & Sully",
    styleId: 'treble-jig',
    bpm: 73,
    duration: 238,
    artworkColor: '#49A47A',
    stem: 'Metronome stem',
    isDownloaded: true
  },
  {
    id: 'd6',
    title: 'The Butterfly Set',
    artist: "Sean O'Brien",
    styleId: 'slip-jig',
    bpm: 113,
    duration: 205,
    artworkColor: '#6B58D6',
    stem: 'Drums',
    isDownloaded: true
  }
];

const DOWNLOADED_PLAYLISTS: DownloadedPlaylist[] = [
  {
    id: 'downloaded',
    name: 'Downloaded Tracks',
    count: 31,
    coverColor: '#D9D9D9',
    trackIds: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']
  },
  {
    id: 'favourites',
    name: 'My Favourites',
    count: 11,
    coverColor: '#5E6673',
    trackIds: ['d2', 'd4', 'd6']
  },
  {
    id: 'practice',
    name: 'Practice playlist',
    count: 20,
    coverColor: '#CFCFCF',
    trackIds: ['d1', 'd3', 'd5']
  }
];

function signatureToBeats(signature: string) {
  if (signature === '2/4') return 2;
  if (signature === '3/4') return 3;
  if (signature === '6/8') return 6;
  if (signature === '9/8') return 9;
  return 4;
}

function formatRange(range: [number, number]) {
  return `${range[0]}-${range[1]} BPM`;
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export function FeisMinimalScreen({
  onClose,
  embedded = false
}: FeisMinimalScreenProps) {
  const {
    isPlaying,
    togglePlay,
    stop,
    bpm,
    setBpm,
    beatsPerMeasure,
    setBeatsPerMeasure,
    accentFirstBeat,
    setAccentFirstBeat,
    currentBeat
  } = useMetronome();
  const {
    currentTrack,
    isPlaying: isTrackPlaying,
    playTrack,
    togglePlayPause,
    progress,
    currentTime
  } = usePlayer();

  const [selection, setSelection] = useState<PracticeSelection | null>(null);
  const [showSelectionSheet, setShowSelectionSheet] = useState(false);
  const [showTimeSigPicker, setShowTimeSigPicker] = useState(false);
  const [selectionView, setSelectionView] = useState<SelectionView>('root');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  const selectedPreset =
  selection?.type === 'preset' ?
  PRACTICE_PRESETS.find((preset) => preset.id === selection.presetId) :
  null;
  const selectedTrack =
  selection?.type === 'track' ?
  DOWNLOADED_TRACKS.find((track) => track.id === selection.trackId) :
  null;
  const selectedStyle = useMemo(() => {
    if (selectedPreset) {
      return DANCE_STYLES.find((style) => style.id === selectedPreset.id);
    }
    if (selectedTrack) {
      return DANCE_STYLES.find((style) => style.id === selectedTrack.styleId);
    }
    return null;
  }, [selectedPreset, selectedTrack]);

  const hasSelection = Boolean(selectedPreset || selectedTrack);
  const defaultBpm = selectedPreset?.bpm ?? selectedTrack?.bpm ?? 0;
  const bpmRange =
  selectedPreset?.bpmRange ?? selectedStyle?.bpmRange ?? ([40, 220] as [number, number]);
  const dialValue = hasSelection ? bpm : 40;
  const displayBpm = hasSelection ? bpm : 0;
  const speedPercent = hasSelection ? Math.round(bpm / defaultBpm * 100) : 100;
  const timeSignatureLabel =
  beatsPerMeasure === 2 ?
  '2/4' :
  beatsPerMeasure === 3 ?
  '3/4' :
  beatsPerMeasure === 6 ?
  '6/8' :
  beatsPerMeasure === 9 ?
  '9/8' :
  '4/4';
  const isPracticePlaying = hasSelection ? isPlaying || isTrackPlaying : false;
  const isCustomTempo = hasSelection && bpm !== defaultBpm;

  useEffect(() => {
    if (!selection) {
      setBpm(113);
      setBeatsPerMeasure(4);
      setAccentFirstBeat(false);
    }
    if (selectedPreset) {
      setBpm(selectedPreset.bpm);
      setBeatsPerMeasure(signatureToBeats(selectedPreset.timeSignature));
      setAccentFirstBeat(selectedPreset.accentFirstBeat);
    }
    if (selectedTrack) {
      setBpm(selectedTrack.bpm);
      setBeatsPerMeasure(
        signatureToBeats(selectedStyle?.timeSignature ?? '4/4')
      );
      setAccentFirstBeat(true);
    }
  }, [
    selection,
    selectedPreset,
    selectedTrack,
    selectedStyle,
    setAccentFirstBeat,
    setBeatsPerMeasure,
    setBpm
  ]);

  useEffect(() => {
    if (!showSelectionSheet) {
      setSelectionView('root');
      setSelectedPlaylistId(null);
    }
  }, [showSelectionSheet]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleResetTempo = () => {
    if (defaultBpm > 0) setBpm(defaultBpm);
  };

  const handlePracticeToggle = () => {
    if (!hasSelection) return;

    if (isPracticePlaying) {
      if (isTrackPlaying) togglePlayPause();
      if (isPlaying) togglePlay();
      return;
    }

    if (selectedTrack) {
      if (currentTrack?.id === selectedTrack.id) {
        togglePlayPause();
      } else {
        playTrack(selectedTrack);
      }
    }

    if (!isPlaying) togglePlay();
  };

  const handlePresetSelect = (preset: PracticePreset) => {
    setSelection({
      type: 'preset',
      presetId: preset.id
    });
    setShowSelectionSheet(false);
  };

  const handleTrackSelect = (track: DownloadedTrack) => {
    setSelection({
      type: 'track',
      trackId: track.id
    });
    setShowSelectionSheet(false);
  };

  const bottomOffset = embedded ? 88 : 0;
  const actionBottomOffset = embedded ? 72 : 0;

  return (
    <div
      className={`${embedded ? 'w-full h-full' : 'absolute inset-0 z-50'} flex flex-col relative`}
      style={{
        backgroundColor: BG
      }}>
      
      <header className="px-5 pt-12 pb-2 flex items-center justify-between min-h-[44px] flex-shrink-0">
        {onClose ?
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:opacity-70"
          aria-label="Back">
          
            <ChevronDown size={26} className="text-neutral-900" />
          </button> :

        <div className="w-7" />
        }
        <div className="w-7" />
      </header>

      <div
        className="flex-1 overflow-y-auto px-5"
        style={{
          paddingBottom: bottomOffset + 104
        }}>
        
        <h1 className="text-[32px] font-bold tracking-tight text-neutral-900 mb-4">
          Practice
        </h1>

        <PracticeSelectionCard
          preset={selectedPreset}
          track={selectedTrack}
          selectedStyleName={selectedStyle?.name}
          onOpen={() => setShowSelectionSheet(true)} />

        <div
          className={`flex flex-col items-center justify-center transition-opacity ${selectedTrack ? 'my-2' : 'my-4'} ${hasSelection ? 'opacity-100' : 'opacity-35'}`}>
          
          <RotaryDial
            value={dialValue}
            min={40}
            max={220}
            step={1}
            onChange={(next) => {
              if (hasSelection) setBpm(next);
            }}
            size={selectedTrack ? 220 : 260}
            isPlaying={isPracticePlaying}
            isAccent={accentFirstBeat && currentBeat === 0}
            beatPulseKey={currentBeat}
            accentColor={ACCENT}>
            
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[13px] text-neutral-500 tabular-nums mb-1">
                {speedPercent}%
              </div>
              <div className={`${selectedTrack ? 'text-[58px]' : 'text-[68px]'} font-bold tracking-tighter text-neutral-900 leading-none`}>
                {displayBpm}
              </div>
              <div className="text-xs font-medium text-neutral-500 tracking-wide mt-1">
                BPM
              </div>
            </div>
          </RotaryDial>

          <div className="h-7 mt-3 flex items-center">
            <AnimatePresence>
              {isCustomTempo &&
              <motion.button
                initial={{
                  opacity: 0,
                  y: -4
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                exit={{
                  opacity: 0,
                  y: -4
                }}
                onClick={handleResetTempo}
                className="flex items-center gap-1.5 text-[14px] font-semibold active:opacity-70 px-2 py-1"
                style={{
                  color: ACCENT
                }}>
                
                  <RotateCcw size={14} />
                  Reset to original ({defaultBpm} BPM)
                </motion.button>
              }
            </AnimatePresence>
          </div>
        </div>

        <div
          className={`${selectedTrack ? 'mt-2' : 'mt-4'} rounded-2xl overflow-hidden shadow-sm`}
          style={{
            backgroundColor: CARD_BG
          }}>
          
          <button
            onClick={() => setShowTimeSigPicker(true)}
            className="w-full px-4 py-3.5 flex items-center justify-between active:bg-neutral-50"
            aria-label="Change time signature">
            
            <span className="text-[15px] font-medium text-neutral-900">
              Time signature
            </span>
            <span
              className="flex items-center gap-1 text-[15px] font-semibold"
              style={{
                color: ACCENT
              }}>
              
              {timeSignatureLabel}
              <ChevronRight size={15} />
            </span>
          </button>
          <div className="h-px bg-neutral-100 mx-4" />
          <div className="px-4 py-3.5 flex items-center justify-between">
            <span className="text-[15px] font-medium text-neutral-900">
              Accent first beat
            </span>
            <button
              onClick={() => setAccentFirstBeat(!accentFirstBeat)}
              className="w-12 h-7 rounded-full transition-colors relative flex-shrink-0"
              style={{
                backgroundColor: accentFirstBeat ? ACCENT : '#D6CCC4'
              }}
              aria-pressed={accentFirstBeat}
              aria-label="Toggle accent first beat">
              
              <span
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${accentFirstBeat ? 'left-[22px]' : 'left-0.5'}`} />
              
            </button>
          </div>
        </div>

      </div>

      <div
        className="absolute left-0 right-0 z-30 px-5 pt-6 pb-4 flex justify-center pointer-events-none"
        style={{
          bottom: actionBottomOffset,
          background: `linear-gradient(to bottom, rgba(251,243,238,0) 0%, ${BG} 45%, ${BG} 100%)`
        }}>
        
        <button
          onClick={handlePracticeToggle}
          disabled={!hasSelection}
          className={`h-14 px-12 rounded-full text-white font-bold text-[16px] flex items-center gap-2 shadow-lg transition-transform pointer-events-auto ${hasSelection ? 'active:scale-95' : 'opacity-0 pointer-events-none'}`}
          style={{
            backgroundColor: ACCENT
          }}
          aria-label={isPracticePlaying ? 'Stop practice' : 'Start practice'}>
          
          {isPracticePlaying ?
          <>
              <Pause size={18} fill="currentColor" />
              Stop
            </> :

          <>
              <Play size={18} fill="currentColor" className="ml-0.5" />
              Start
            </>
          }
        </button>
      </div>

      <AnimatePresence>
        {showSelectionSheet &&
        <SelectionSheet
          view={selectionView}
          selectedPlaylistId={selectedPlaylistId}
          selection={selection}
          onClose={() => setShowSelectionSheet(false)}
          onBack={() => {
            if (selectionView === 'tracks') {
              setSelectionView('playlists');
              return;
            }
            setSelectionView('root');
          }}
          onShowPlaylists={() => setSelectionView('playlists')}
          onSelectPlaylist={(playlistId) => {
            setSelectedPlaylistId(playlistId);
            setSelectionView('tracks');
          }}
          onSelectPreset={handlePresetSelect}
          onSelectTrack={handleTrackSelect} />
        }
      </AnimatePresence>

      <AnimatePresence>
        {showTimeSigPicker &&
        <PickerSheet
          title="Time Signature"
          onClose={() => setShowTimeSigPicker(false)}>
          
            {[
          {
            label: '2/4',
            beats: 2
          },
          {
            label: '3/4',
            beats: 3
          },
          {
            label: '4/4',
            beats: 4
          },
          {
            label: '6/8',
            beats: 6
          },
          {
            label: '9/8',
            beats: 9
          }].
          map((opt) => {
            const isActive = beatsPerMeasure === opt.beats;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setBeatsPerMeasure(opt.beats);
                  setShowTimeSigPicker(false);
                }}
                className="w-full min-h-[48px] px-4 py-3.5 flex items-center justify-between active:bg-neutral-50">
                
                  <span className="text-[15px] font-medium text-neutral-900">
                    {opt.label}
                  </span>
                  {isActive &&
                <Check size={18} style={{ color: ACCENT }} />
                }
                </button>);

          })}
          </PickerSheet>
        }
      </AnimatePresence>
    </div>);

}

function SelectedTrackCard({
  track,
  progress,
  currentTime
}: {
  track: DownloadedTrack;
  progress: number;
  currentTime: number;
}) {
  return (
    <div
      className="rounded-2xl shadow-sm overflow-hidden mb-3"
      style={{
        backgroundColor: CARD_BG
      }}>
      
      <div className="px-4 py-3 flex items-center gap-3">
        <Artwork color={track.artworkColor} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-neutral-900 truncate">
            {track.title}
          </div>
          <div className="text-[13px] text-neutral-500 truncate">
            {track.artist}
          </div>
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-400 active:bg-neutral-50"
          aria-label="More track options">
          
          <span className="text-[22px] leading-none">...</span>
        </button>
      </div>
      <button className="w-full px-4 py-2.5 flex items-center justify-between border-t border-neutral-100 active:bg-neutral-50">
        <span className="text-[15px] font-medium text-neutral-900">
          Track stems
        </span>
        <span className="flex items-center gap-1 text-[13px] text-neutral-500">
          {track.stem}
          <ChevronRight size={15} style={{ color: ACCENT }} />
        </span>
      </button>
      {progress > 0 &&
      <div className="px-4 pb-4">
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: ACCENT
            }} />
          
          </div>
          <div className="mt-2 text-[12px] text-neutral-500 tabular-nums">
            {formatTime(currentTime)}
          </div>
        </div>
      }
    </div>);

}

function PracticeSelectionCard({
  preset,
  track,
  selectedStyleName,
  onOpen
}: {
  preset: PracticePreset | null | undefined;
  track: DownloadedTrack | null | undefined;
  selectedStyleName?: string;
  onOpen: () => void;
}) {
  if (!preset && !track) {
    return (
      <button
        onClick={onOpen}
        className="w-full rounded-2xl px-5 py-7 mb-8 border border-dashed text-center active:scale-[0.99] transition-transform"
        style={{
          borderColor: `${ACCENT}80`,
          backgroundColor: 'rgba(255,255,255,0.24)'
        }}
        aria-label="Select preset or downloaded track">
        
        <div className="text-[20px] font-bold text-neutral-900 mb-2">
          Select preset or track
        </div>
        <div className="text-[15px] leading-5 text-neutral-500 max-w-[280px] mx-auto mb-5">
          Add a preset or downloaded track you want to practise with.
        </div>
        <span
          className="inline-flex h-9 min-w-[90px] items-center justify-center rounded-full px-5 text-[15px] font-bold text-white shadow-sm"
          style={{
            backgroundColor: ACCENT
          }}>
          
          Select
        </span>
      </button>);

  }

  if (preset) {
    return (
      <div className="mb-5">
        <div className="text-[13px] text-neutral-500 mb-1 px-1">
          Active practice
        </div>
        <button
          onClick={onOpen}
          className="w-full rounded-2xl bg-white px-4 py-4 shadow-sm border text-left flex items-center gap-3 active:bg-neutral-50 transition-colors"
          style={{
            borderColor: `${ACCENT}55`
          }}
          aria-label="Change preset selection">
          
          <div className="flex-1 min-w-0">
            <div className="text-[17px] font-bold text-neutral-900 truncate">
              {preset.name}
            </div>
            <div className="text-[13px] text-neutral-500 truncate mt-0.5">
              {preset.timeSignature} · {formatRange(preset.bpmRange)} · Preset
            </div>
          </div>
          <ChevronRight size={18} style={{ color: ACCENT }} />
        </button>
      </div>);

  }

  const selectedTrack = track;
  if (!selectedTrack) return null;

  return (
    <div className="mb-5">
      <div className="text-[13px] text-neutral-500 mb-1 px-1">
        Selected track
      </div>
      <button
        onClick={onOpen}
        className="w-full rounded-2xl bg-white px-4 py-3 shadow-sm border text-left flex items-center gap-3 active:bg-neutral-50 transition-colors"
        style={{
          borderColor: `${ACCENT}55`
        }}
        aria-label="Change downloaded track selection">
        
        <Artwork color={selectedTrack.artworkColor} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-neutral-900 truncate">
            {selectedTrack.title}
          </div>
          <div className="text-[13px] text-neutral-500 truncate">
            {selectedTrack.artist}
          </div>
          <div className="text-[12px] text-neutral-400 truncate mt-0.5">
            {selectedTrack.stem} · {selectedTrack.bpm} BPM{selectedStyleName ? ` · ${selectedStyleName}` : ''}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: ACCENT }} />
      </button>
    </div>);

}

function SelectionSheet({
  view,
  selectedPlaylistId,
  selection,
  onClose,
  onBack,
  onShowPlaylists,
  onSelectPlaylist,
  onSelectPreset,
  onSelectTrack
}: {
  view: SelectionView;
  selectedPlaylistId: string | null;
  selection: PracticeSelection | null;
  onClose: () => void;
  onBack: () => void;
  onShowPlaylists: () => void;
  onSelectPlaylist: (playlistId: string) => void;
  onSelectPreset: (preset: PracticePreset) => void;
  onSelectTrack: (track: DownloadedTrack) => void;
}) {
  const playlist = DOWNLOADED_PLAYLISTS.find(
    (item) => item.id === selectedPlaylistId
  );
  const visibleTracks = playlist ?
  DOWNLOADED_TRACKS.filter((track) => playlist.trackIds.includes(track.id)) :
  DOWNLOADED_TRACKS;

  const title =
  view === 'root' ?
  'Select preset or track' :
  view === 'playlists' ?
  'Select a track' :
  'Select a track';

  const subtitle =
  view === 'playlists' ?
  'Only downloaded tracks are visible' :
  view === 'tracks' ?
  'Select downloaded tracks' :
  undefined;

  return (
    <PickerSheet
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      onBack={view === 'root' ? undefined : onBack}
      closeIcon>
      
      {view === 'root' &&
      <div className="px-3 py-3">
          <button
          onClick={onShowPlaylists}
          className="w-full min-h-[56px] rounded-xl bg-white px-3 py-3 flex items-center gap-3 text-left active:bg-neutral-50 mb-4">
          
            <span
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              color: ACCENT,
              backgroundColor: `${ACCENT}14`
            }}>
            
              <Plus size={22} />
            </span>
            <span className="text-[14px] font-semibold" style={{ color: ACCENT }}>
              Select a downloaded track
            </span>
          </button>

          <div className="text-[12px] font-semibold text-neutral-500 mb-2 px-1">
            Presets
          </div>
          <div className="rounded-xl overflow-hidden bg-white">
            {PRACTICE_PRESETS.map((preset) => {
            const isSelected =
            selection?.type === 'preset' && selection.presetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className="w-full min-h-[56px] px-3 py-3 flex items-center gap-3 text-left border-b border-neutral-100 last:border-b-0 active:bg-neutral-50">
                
                  <Radio checked={isSelected} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-medium text-neutral-900">
                      {preset.name}
                    </div>
                    <div className="text-[12px] text-neutral-500">
                      {preset.timeSignature} · {formatRange(preset.bpmRange)}
                    </div>
                  </div>
                </button>);

          })}
          </div>
        </div>
      }

      {view === 'playlists' &&
      <div className="px-3 py-3 space-y-2">
          {DOWNLOADED_PLAYLISTS.map((item) =>
        <button
          key={item.id}
          onClick={() => onSelectPlaylist(item.id)}
          className="w-full min-h-[66px] rounded-xl bg-white px-3 py-3 flex items-center gap-3 text-left active:bg-neutral-50">
          
              <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{
              backgroundColor: item.coverColor
            }}>
            
                <Music2 size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-neutral-900">
                  {item.name}
                </div>
                <div className="text-[12px] text-neutral-500">
                  Downloaded · {item.count} Songs
                </div>
              </div>
            </button>
        )}
        </div>
      }

      {view === 'tracks' &&
      <div className="px-3 py-3 space-y-2">
          {visibleTracks.map((track) => {
          const isSelected =
          selection?.type === 'track' && selection.trackId === track.id;
          return (
            <button
              key={track.id}
              onClick={() => onSelectTrack(track)}
              className="w-full min-h-[66px] rounded-xl bg-white px-3 py-3 flex items-center gap-3 text-left active:bg-neutral-50">
              
                <Artwork color={track.artworkColor} />
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-neutral-900 truncate">
                    {track.title}
                  </div>
                  <div className="text-[12px] text-neutral-500 truncate">
                    {track.artist}
                  </div>
                </div>
                {isSelected && <Check size={18} style={{ color: ACCENT }} />}
              </button>);

        })}
        </div>
      }
    </PickerSheet>);

}

function PickerSheet({
  title,
  subtitle,
  children,
  onClose,
  onBack,
  closeIcon = false
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  onBack?: () => void;
  closeIcon?: boolean;
}) {
  return (
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
        onClick={onClose}
        className="absolute inset-0 bg-black/30 z-[60]" />
      
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
          damping: 28,
          stiffness: 260
        }}
        className="absolute bottom-0 left-0 right-0 rounded-t-3xl z-[70] pb-10"
        style={{
          backgroundColor: BG
        }}>
        
        <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mt-3 mb-2" />
        <div className="px-4 py-2 flex items-center justify-between border-b border-neutral-100">
          <div className="flex items-center gap-2 min-w-0">
            {onBack &&
            <button
              onClick={onBack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 active:bg-white"
              aria-label="Back">
              
                <ChevronLeft size={20} />
              </button>
            }
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-neutral-900 truncate">
                {title}
              </h3>
              {subtitle &&
              <div className="text-[12px] text-neutral-500">{subtitle}</div>
              }
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 active:bg-white"
            aria-label="Close selection">
            
            {closeIcon ? <X size={17} /> : <span className="text-[15px] font-semibold" style={{ color: ACCENT }}>Done</span>}
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto">{children}</div>
      </motion.div>
    </>);

}

function Radio({ checked }: {checked: boolean;}) {
  return (
    <span
      className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0"
      style={{
        borderColor: checked ? ACCENT : '#E7DDD8'
      }}>
      
      {checked &&
      <span
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: ACCENT
        }} />
      }
    </span>);

}

function Artwork({ color }: {color: string;}) {
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 overflow-hidden"
      style={{
        backgroundColor: color
      }}>
      
      <div className="w-9 h-9 rounded-full bg-yellow-300/90 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-rose-500/90 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-neutral-900/70" />
        </div>
      </div>
    </div>);

}
