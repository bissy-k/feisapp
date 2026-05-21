import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Music2,
  Plus,
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
  timeSignature: string;
  accentFirstBeat: boolean;
};

type DownloadedTrack = Track & {
  stem: string;
  stems: string[];
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
type SessionState = 'ready' | 'running' | 'paused';

const ACCENT = '#E56D56';
const BG = '#FBF6F3';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#333333';
const TEXT_SECONDARY = '#666666';
const TEXT_TERTIARY = '#595959';
const BORDER = '#D0D5DD';

const PRACTICE_PRESETS: PracticePreset[] = [
  {
    id: 'reel',
    name: 'Reel',
    bpm: 113,
    timeSignature: '4/4',
    accentFirstBeat: false
  },
  {
    id: 'light-jig',
    name: 'Light Jig',
    bpm: 116,
    timeSignature: '6/8',
    accentFirstBeat: false
  },
  {
    id: 'slip-jig',
    name: 'Slip Jig',
    bpm: 113,
    timeSignature: '9/8',
    accentFirstBeat: false
  },
  {
    id: 'treble-jig',
    name: 'Treble Jig',
    bpm: 73,
    timeSignature: '6/8',
    accentFirstBeat: false
  },
  {
    id: 'hornpipe',
    name: 'Hornpipe',
    bpm: 113,
    timeSignature: '4/4',
    accentFirstBeat: false
  },
  {
    id: 'set-dance',
    name: 'Set Dance',
    bpm: 100,
    timeSignature: 'Varies',
    accentFirstBeat: false
  },
  {
    id: 'traditional-set',
    name: 'Traditional Set',
    bpm: 110,
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
    stems: ['Drums', 'Piano', 'Bass'],
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
    stems: ['Drums', 'Piano', 'Bass'],
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
    stem: 'Drums',
    stems: ['Drums', 'Piano', 'Bass'],
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
    stems: ['Drums', 'Piano', 'Bass'],
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
    stem: 'Drums',
    stems: ['Drums', 'Piano', 'Bass'],
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
    stems: ['Drums', 'Piano', 'Bass'],
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

function defaultBeatsForSignature(signature: string | undefined) {
  if (!signature || signature === 'Varies') return null;
  return signatureToBeats(signature);
}

function formatBpm(value: number) {
  return `${value} BPM`;
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
    stopTrack,
    progress,
    currentTime
  } = usePlayer();

  const [selection, setSelection] = useState<PracticeSelection | null>(null);
  const [showSelectionSheet, setShowSelectionSheet] = useState(false);
  const [showTimeSigPicker, setShowTimeSigPicker] = useState(false);
  const [showStemPicker, setShowStemPicker] = useState(false);
  const [selectionView, setSelectionView] = useState<SelectionView>('root');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );
  const [selectedStems, setSelectedStems] = useState<string[]>(['Drums']);
  const [sessionState, setSessionState] = useState<SessionState>('ready');

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
  const bpmRange = selectedStyle?.bpmRange ?? ([40, 220] as [number, number]);
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
  const isPracticePlaying = hasSelection && sessionState === 'running';
  const primaryActionLabel =
  sessionState === 'running' ?
  'Pause' :
  sessionState === 'paused' ?
  'Resume' :
  'Start';
  const isSelectedTrackLoaded = currentTrack?.id === selectedTrack?.id;
  const selectedTrackProgress = isSelectedTrackLoaded ? progress : 0;
  const selectedTrackTime = isSelectedTrackLoaded ? currentTime : 0;
  const selectedStemLabel =
  selectedStems.length > 1 ? selectedStems.join(', ') : selectedStems[0] ?? 'Drums';
  const isCustomTempo = hasSelection && defaultBpm > 0 && bpm !== defaultBpm;
  const defaultTimeSignatureBeats = defaultBeatsForSignature(
    selectedPreset?.timeSignature ?? selectedStyle?.timeSignature
  );
  const settingsTopClass = selectedTrack ? 'mt-6' : hasSelection ? 'mt-9' : 'mt-4';

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
      setSelectedStems([selectedTrack.stem]);
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
    if (!selectedTrack) setShowStemPicker(false);
  }, [selectedTrack]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handleResetTempo = () => {
    if (defaultBpm > 0) setBpm(defaultBpm);
  };

  const handleStartSession = () => {
    if (!hasSelection) return;

    if (selectedTrack) {
      if (currentTrack?.id === selectedTrack.id) {
        if (!isTrackPlaying) togglePlayPause();
      } else {
        playTrack(selectedTrack);
      }
    }

    if (!isPlaying) togglePlay();
    setSessionState('running');
  };

  const handlePauseSession = () => {
    if (isPlaying) togglePlay();
    if (selectedTrack && currentTrack?.id === selectedTrack.id && isTrackPlaying) {
      togglePlayPause();
    }
    setSessionState('paused');
  };

  const handleResumeSession = () => {
    if (!hasSelection) return;

    if (selectedTrack) {
      if (currentTrack?.id === selectedTrack.id) {
        if (!isTrackPlaying) togglePlayPause();
      } else {
        playTrack(selectedTrack);
      }
    }

    if (!isPlaying) togglePlay();
    setSessionState('running');
  };

  const handlePrimaryAction = () => {
    if (sessionState === 'running') {
      handlePauseSession();
      return;
    }
    if (sessionState === 'paused') {
      handleResumeSession();
      return;
    }
    handleStartSession();
  };

  const handleCancelSession = () => {
    if (isPlaying) stop();
    if (currentTrack) stopTrack();
    setSelection(null);
    setSelectedStems(['Drums']);
    setSessionState('ready');
  };

  const handlePresetSelect = (preset: PracticePreset) => {
    handleCancelSession();
    setSelection({
      type: 'preset',
      presetId: preset.id
    });
    setSessionState('ready');
    setShowSelectionSheet(false);
  };

  const handleStemToggle = (stem: string) => {
    setSelectedStems((prev) => {
      if (prev.includes(stem)) {
        const next = prev.filter((item) => item !== stem);
        return next.length ? next : prev;
      }
      return [...prev, stem];
    });
  };

  const handleTrackSelect = (track: DownloadedTrack) => {
    handleCancelSession();
    setSelection({
      type: 'track',
      trackId: track.id
    });
    setSessionState('ready');
    setShowSelectionSheet(false);
  };

  const bottomOffset = embedded ? 88 : 0;
  const actionBottomOffset = embedded ? 64 : 0;
  const scrollBottomPadding = bottomOffset + (hasSelection ? 118 : 24);

  return (
    <div
      className={`${embedded ? 'w-full h-full' : 'absolute inset-0 z-50'} flex flex-col relative`}
      style={{
        backgroundColor: BG
      }}>
      
      <header className="px-4 pt-[54px] pb-2 flex items-center justify-between h-[101px] flex-shrink-0 relative">
        {onClose ?
        <button
          onClick={onClose}
          className="p-1 -ml-1 active:opacity-70 z-10"
          aria-label="Back">
          
            <ChevronDown size={26} className="text-neutral-900" />
          </button> :

        <div className="w-7" />
        }
        <div
          className="absolute left-16 right-16 top-[70px] text-center text-[16px] font-semibold leading-5"
          style={{
            color: TEXT_PRIMARY
          }}>
          
          Metronome
        </div>
        <div className="w-7" />
      </header>

      <div
        className="flex-1 overflow-y-auto scrollbar-none px-4"
        style={{
          paddingTop: hasSelection ? 0 : 20,
          paddingBottom: scrollBottomPadding
        }}>
        
        <PracticeSelectionCard
          preset={selectedPreset}
          track={selectedTrack}
          progress={selectedTrackProgress}
          currentTime={selectedTrackTime}
          sessionState={sessionState}
          onOpen={() => setShowSelectionSheet(true)} />

        <div
          className={`flex flex-col items-center justify-center transition-opacity ${selectedTrack ? 'mt-4' : 'mt-5'} ${hasSelection ? 'opacity-100' : 'opacity-50'}`}>
          
          <RotaryDial
            value={dialValue}
            min={40}
            max={220}
            step={1}
            onChange={(next) => {
              if (hasSelection) setBpm(next);
            }}
            size={260}
            isPlaying={isPracticePlaying}
            isAccent={accentFirstBeat && currentBeat === 0}
            beatPulseKey={currentBeat}
            accentColor={ACCENT}>
            
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[12px] text-[#737373] tabular-nums mb-1 tracking-[0.3px]">
                {speedPercent}%
              </div>
              <div className="text-[64px] font-medium tracking-[-3.2px] text-[#171717] leading-none">
                {displayBpm}
              </div>
              <div className="text-[12px] font-medium text-[#737373] tracking-[0.3px] mt-2">
                BPM
              </div>
            </div>
          </RotaryDial>

          {isCustomTempo ?
          <button
            onClick={handleResetTempo}
            className="mt-4 text-[12px] font-semibold leading-[18px] focus:outline-none active:opacity-70"
            style={{
              color: ACCENT
            }}>
            
            Reset to original ({defaultBpm} BPM)
          </button> :
          <div className="mt-4 text-[12px] leading-[18px] text-[#737373]">
              Drag the dial to adjust tempo
            </div>
          }
        </div>

        <div
          className={`${settingsTopClass} rounded-xl overflow-hidden shadow-sm`}
          style={{
          backgroundColor: CARD_BG
          }}>
          
          {selectedTrack &&
          <>
              <button
              onClick={() => setShowStemPicker(true)}
              className="w-full h-[53px] px-4 flex items-center justify-between active:bg-neutral-50 focus:outline-none"
              aria-label="Change track stem">
              
                <span className="text-[14px] font-medium leading-[22px]" style={{ color: TEXT_PRIMARY }}>
                  Track stems
                </span>
                <span className="flex items-center gap-1 text-[12px] leading-4 tracking-[0.5px]" style={{ color: TEXT_TERTIARY }}>
                  {selectedStemLabel}
                  <ChevronRight size={16} style={{ color: ACCENT }} />
                </span>
              </button>
              <div className="h-px" style={{ backgroundColor: BORDER }} />
            </>
          }

          <button
            onClick={() => {
              if (hasSelection) setShowTimeSigPicker(true);
            }}
            disabled={!hasSelection}
            className={`w-full h-[53px] px-4 flex items-center justify-between focus:outline-none ${hasSelection ? 'active:bg-neutral-50' : 'cursor-not-allowed'}`}
            style={{
              opacity: hasSelection ? 1 : 0.45
            }}
            aria-label="Change time signature">
            
            <span className="text-[14px] font-medium leading-[22px]" style={{ color: TEXT_PRIMARY }}>
              Time signature
            </span>
            <span
              className="flex items-center gap-1 text-[12px] leading-4 tracking-[0.5px]"
              style={{
                color: TEXT_TERTIARY
              }}>
              
              {timeSignatureLabel}
              <ChevronRight size={16} style={{ color: hasSelection ? ACCENT : TEXT_TERTIARY }} />
            </span>
          </button>
          <div className="h-px" style={{ backgroundColor: BORDER }} />
          <div
            className="h-[53px] px-4 flex items-center justify-between"
            style={{
              opacity: hasSelection ? 1 : 0.45
            }}>
            <span className="text-[14px] font-medium leading-[22px]" style={{ color: TEXT_PRIMARY }}>
              Accent first beat
            </span>
            <button
              onClick={() => {
                if (hasSelection) setAccentFirstBeat(!accentFirstBeat);
              }}
              disabled={!hasSelection}
              className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 p-0.5 focus:outline-none ${hasSelection ? '' : 'cursor-not-allowed'}`}
              style={{
                backgroundColor: accentFirstBeat ? ACCENT : BORDER
              }}
              aria-pressed={accentFirstBeat}
              aria-label="Toggle accent first beat">
              
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${accentFirstBeat ? 'left-[18px]' : 'left-0.5'}`} />
              
            </button>
          </div>
        </div>

      </div>

      {hasSelection &&
      <div
        className="absolute left-0 right-0 z-50 flex justify-center gap-2 overflow-hidden rounded-t-lg bg-white p-4 pointer-events-none"
        style={{
          bottom: actionBottomOffset
        }}>
        <button
          onClick={handleCancelSession}
          className="h-12 flex-1 rounded-full px-4 font-semibold text-[14px] leading-5 tracking-[-0.4px] flex items-center justify-center transition-transform pointer-events-auto active:scale-95 focus:outline-none"
          style={{
            backgroundColor: 'rgba(229,109,86,0.15)',
            color: ACCENT
          }}
          aria-label="Cancel metronome session">
          
          Cancel
        </button>
        <button
          onClick={handlePrimaryAction}
          className="h-12 flex-1 rounded-full px-4 font-semibold text-[14px] leading-5 tracking-[-0.4px] flex items-center justify-center text-white transition-transform pointer-events-auto active:scale-95 focus:outline-none"
          style={{
            backgroundColor: ACCENT
          }}
          aria-label={`${primaryActionLabel.toLowerCase()} metronome session`}>
          
          {primaryActionLabel}
        </button>
      </div>
      }

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
          title="Time signature"
          onClose={() => setShowTimeSigPicker(false)}>
          
          <div className="px-4 py-3">
            <div className="rounded-xl overflow-hidden bg-white">
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
            const isDefault = defaultTimeSignatureBeats === opt.beats;
            return (
              <button
                key={opt.label}
                onClick={() => {
                  setBeatsPerMeasure(opt.beats);
                  setShowTimeSigPicker(false);
                }}
                className="w-full h-[53px] px-4 flex items-center gap-4 text-left border-b last:border-b-0 active:bg-neutral-50 focus:outline-none"
                style={{
                  borderColor: BORDER
                }}>
                
                <Radio checked={isActive} />
                <span className="text-[14px] font-medium leading-[22px]" style={{ color: TEXT_PRIMARY }}>
                  {opt.label}{isDefault ? ' (default)' : ''}
                </span>
              </button>);

          })}
            </div>
          </div>
          </PickerSheet>
        }
      </AnimatePresence>

      <AnimatePresence>
        {showStemPicker && selectedTrack &&
        <PickerSheet
          title="Track stems"
          onClose={() => setShowStemPicker(false)}
          closeIcon>
          
          <div className="px-4 py-3">
            <div className="rounded-xl overflow-hidden bg-white">
          {selectedTrack.stems.map((stem) => {
            const isChecked = selectedStems.includes(stem);
            return (
              <button
                key={stem}
                onClick={() => handleStemToggle(stem)}
                className="w-full h-[53px] px-4 flex items-center gap-4 text-left border-b last:border-b-0 active:bg-neutral-50 focus:outline-none"
                style={{
                  borderColor: BORDER
                }}>
                
                <Checkbox checked={isChecked} />
                <span className="text-[14px] font-medium leading-[22px]" style={{ color: TEXT_PRIMARY }}>
                  {stem}
                </span>
              </button>);

          })}
            </div>
          </div>
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
  progress,
  currentTime,
  sessionState,
  onOpen
}: {
  preset: PracticePreset | null | undefined;
  track: DownloadedTrack | null | undefined;
  progress: number;
  currentTime: number;
  sessionState: SessionState;
  onOpen: () => void;
}) {
  if (!preset && !track) {
    return (
      <button
        onClick={onOpen}
        className="w-full rounded-xl px-4 py-4 border-2 border-dashed text-center active:scale-[0.99] transition-transform"
        style={{
          borderColor: '#A3A3A3',
          backgroundColor: 'transparent'
        }}
        aria-label="Select preset or downloaded track">
        
        <div className="text-[16px] font-semibold leading-5 tracking-[-0.27px] mb-1" style={{ color: '#1C170D' }}>
          Select presets or tracks
        </div>
        <div className="text-[12px] font-medium leading-[18px] max-w-[260px] mx-auto mb-4" style={{ color: TEXT_SECONDARY }}>
          Add presets or downloaded track you want to practise with.
        </div>
        <span
          className="inline-flex h-7 min-w-[77px] items-center justify-center rounded-full px-4 text-[14px] font-semibold leading-5 tracking-[-0.4px] text-white"
          style={{
            backgroundColor: ACCENT
          }}>
          
          Select
        </span>
      </button>);

  }

  if (preset) {
    return (
      <div>
        <button
          onClick={onOpen}
          className="w-full h-[73px] rounded-xl bg-white px-4 text-left flex items-center gap-4 active:bg-neutral-50 transition-colors"
          aria-label="Change preset selection">
          
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium leading-[21px] truncate" style={{ color: TEXT_PRIMARY }}>
              {preset.name}
            </div>
            <div className="text-[12px] leading-[18px] truncate mt-0.5" style={{ color: TEXT_SECONDARY }}>
              {preset.timeSignature} · {formatBpm(preset.bpm)}
            </div>
          </div>
          <ChevronRight size={16} style={{ color: ACCENT }} />
        </button>
      </div>);

  }

  const selectedTrack = track;
  if (!selectedTrack) return null;

  return (
    <div>
      <button
        onClick={onOpen}
          className="w-full h-[72px] rounded-xl bg-white px-3 py-2 text-left flex items-center gap-4 active:bg-neutral-50 transition-colors focus:outline-none"
        aria-label="Change downloaded track selection">
        
        <Artwork
          color={selectedTrack.artworkColor}
          size="lg"
          sessionState={sessionState} />
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium leading-[21px] truncate" style={{ color: TEXT_PRIMARY }}>
            {selectedTrack.title}
          </div>
          <div className="text-[12px] leading-[18px] truncate" style={{ color: TEXT_SECONDARY }}>
            {selectedTrack.artist}
          </div>
        </div>
        <ChevronRight size={16} style={{ color: ACCENT }} />
      </button>
      <div className="mt-[7px] flex items-center gap-[3px]">
        <span className="w-[23px] text-right text-[8px] leading-3 tabular-nums" style={{ color: TEXT_TERTIARY }}>
            {formatTime(currentTime)}
        </span>
        <div className="h-[5px] flex-1 rounded-r overflow-hidden" style={{ backgroundColor: '#F8E1DB' }}>
          <div
            className="h-full rounded transition-all duration-100 ease-linear"
            style={{
              width: `${Math.max(2, Math.min(Math.max(progress, 0), 1) * 100)}%`,
              backgroundColor: ACCENT
            }} />
        </div>
        <span className="w-[23px] text-right text-[8px] leading-3 tabular-nums" style={{ color: TEXT_TERTIARY }}>
          {formatTime(selectedTrack.duration)}
        </span>
      </div>
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
                      {preset.timeSignature} · {formatBpm(preset.bpm)}
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
        className="absolute inset-0 z-[60]"
        style={{
          backgroundColor: 'rgba(0,0,0,0.2)'
        }} />
      
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
        className="absolute bottom-0 left-0 right-0 rounded-t-[10px] z-[70] pb-3 overflow-hidden"
        style={{
          backgroundColor: BG
        }}>
        
        <div className="w-9 h-[5px] bg-[rgba(60,60,67,0.3)] rounded-full mx-auto mt-[10px]" />
        <div
          className="h-[47px] px-4 flex items-end justify-between pb-3 border-b"
          style={{
            borderColor: 'rgba(60,60,67,0.36)'
          }}>
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
              <h3 className="text-[16px] font-semibold leading-5 tracking-[-0.27px] truncate" style={{ color: TEXT_PRIMARY }}>
                {title}
              </h3>
              {subtitle &&
              <div className="text-[12px] leading-[18px]" style={{ color: TEXT_SECONDARY }}>{subtitle}</div>
              }
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] -mb-1 rounded-full flex items-center justify-center bg-black/5 text-[rgba(60,60,67,0.6)] active:bg-black/10"
            aria-label="Close selection">
            
            {closeIcon ? <X size={17} /> : <span className="text-[14px] font-semibold" style={{ color: ACCENT }}>Done</span>}
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto scrollbar-none">{children}</div>
      </motion.div>
    </>);

}

function Radio({ checked }: {checked: boolean;}) {
  return (
    <span
      className="w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 bg-white"
      style={{
        borderColor: checked ? ACCENT : BORDER
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

function Checkbox({ checked }: {checked: boolean;}) {
  return (
    <span
      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 bg-white border"
      style={{
        borderColor: checked ? ACCENT : BORDER
      }}>
      
      {checked && <Check size={12} strokeWidth={2.5} style={{ color: ACCENT }} />}
    </span>);

}

function Artwork({
  color,
  size = 'md',
  sessionState
}: {
  color: string;
  size?: 'md' | 'lg';
  sessionState?: SessionState;
}) {
  const showPlaybackIndicator =
  sessionState === 'running' || sessionState === 'paused';

  return (
    <div
      className={`${size === 'lg' ? 'w-14 h-14 rounded-lg' : 'w-12 h-12 rounded-xl'} relative flex items-center justify-center text-white flex-shrink-0 overflow-hidden`}
      style={{
        backgroundColor: color
      }}>
      
      <div className="w-9 h-9 rounded-full bg-yellow-300/90 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-rose-500/90 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-neutral-900/70" />
        </div>
      </div>
      {showPlaybackIndicator &&
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          {sessionState === 'paused' ?
        <div className="w-0 h-0 border-y-[7px] border-y-transparent border-l-[10px] border-l-white ml-0.5" /> :
        <div className="flex items-end gap-1 h-4" aria-hidden="true">
              {[
            [12, 6, 14, 9],
            [8, 14, 7, 12],
            [14, 9, 15, 6],
            [10, 15, 8, 13]
            ].map((heights, index) =>
            <motion.span
              key={index}
              className="w-[3px] rounded-sm bg-white"
              initial={{ height: heights[0] }}
              animate={{ height: heights }}
              transition={{
                duration: 0.72,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                delay: index * 0.08
              }} />
            )}
            </div>
        }
        </div>
      }
    </div>);

}
