import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext } from
'react';
import { StemId, Track, TRACKS } from '../data/mockData';

export const STEM_DEFS: { id: StemId; label: string }[] = [
  { id: 'drums', label: 'Drums' },
  { id: 'bass', label: 'Bass' },
  { id: 'keys', label: 'Keys' }
];
type StemChannelState = { volume: number; muted: boolean };
type StemsState = Record<StemId, StemChannelState>;
const DEFAULT_STEMS: StemsState = {
  drums: { volume: 1, muted: false },
  bass: { volume: 1, muted: false },
  keys: { volume: 1, muted: false }
};
function isStemAudible(stemId: StemId, stems: StemsState, soloedStemIds: StemId[]) {
  if (soloedStemIds.length > 0) return soloedStemIds.includes(stemId);
  return !stems[stemId].muted;
}

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  playbackBpm: number | null;
  isLooping: boolean;
  loopStart: number; // 0 to 1
  loopEnd: number; // 0 to 1
  favorites: string[];
  stems: StemsState;
  soloedStemIds: StemId[];
};
type PlayerContextType = PlayerState & {
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  stopTrack: () => void;
  setPlaybackBpm: (bpm: number | null) => void;
  seek: (progress: number) => void;
  skipForward: () => void;
  skipBackward: () => void;
  toggleLoop: () => void;
  setLoopPoints: (start: number, end: number) => void;
  toggleFavorite: (trackId: string) => void;
  setStemVolume: (stemId: StemId, volume: number) => void;
  toggleStemMute: (stemId: StemId) => void;
  toggleStemSolo: (stemId: StemId) => void;
  resetStems: () => void;
};
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
export function PlayerProvider({ children }: {children: React.ReactNode;}) {
  const [state, setState] = useState<PlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    playbackBpm: null,
    isLooping: false,
    loopStart: 0,
    loopEnd: 1,
    favorites: ['t1', 't5'], // Mock initial favorites
    stems: DEFAULT_STEMS,
    soloedStemIds: []
  });
  const progressInterval = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);
  const sampleBeatRef = useRef(0);
  const stemsRef = useRef<StemsState>(DEFAULT_STEMS);
  const soloedStemIdsRef = useRef<StemId[]>([]);
  const audioBufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const realStemSourcesRef = useRef<
    Partial<Record<StemId, { source: AudioBufferSourceNode; gain: GainNode }>>>(
  {});
  const realStartContextTimeRef = useRef<number | null>(null);
  const realStartOffsetRef = useRef(0);

  useEffect(() => {
    stemsRef.current = state.stems;
  }, [state.stems]);
  useEffect(() => {
    soloedStemIdsRef.current = state.soloedStemIds;
  }, [state.soloedStemIds]);

  // Keep any currently-playing real stem audio in sync with mixer changes,
  // so the same stems mixer UI that gates the synthesized layers also
  // controls real gain nodes when the current track has real audio.
  useEffect(() => {
    STEM_DEFS.forEach(({ id }) => {
      const entry = realStemSourcesRef.current[id];
      if (!entry) return;
      const audible = isStemAudible(id, state.stems, state.soloedStemIds);
      entry.gain.gain.value = audible ? state.stems[id].volume : 0;
    });
  }, [state.stems, state.soloedStemIds]);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext ||
      (window as Window & {webkitAudioContext?: typeof AudioContext;}).webkitAudioContext;
      if (!AudioContextConstructor) return null;
      audioContextRef.current = new AudioContextConstructor();
    }
    return audioContextRef.current;
  };

  const unlockAudioContext = async () => {
    const context = getAudioContext();
    if (!context) return null;
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context;
  };

  const playPulse = (
    context: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    gainValue: number,
    type: OscillatorType = 'sine'
  ) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  };

  const playNoise = (context: AudioContext, startTime: number, duration: number, gainValue: number) => {
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * Math.pow(1 - index / channel.length, 2);
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(gainValue, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    source.connect(gain);
    gain.connect(context.destination);
    source.start(startTime);
  };

  const scheduleSampleBeat = (track: Track, playbackBpm = track.bpm) => {
    const context = getAudioContext();
    if (!context) return;
    const beat = sampleBeatRef.current;
    const startTime = context.currentTime + 0.015;
    const beatDuration = 60 / playbackBpm;
    const root = 146.83;
    const fifth = 220;
    const stems = stemsRef.current;
    const soloed = soloedStemIdsRef.current;

    if (isStemAudible('drums', stems, soloed)) {
      const v = stems.drums.volume;
      if (beat % 4 === 0) {
        playPulse(context, 72, startTime, 0.18, 0.18 * v, 'sine');
      } else if (beat % 4 === 2) {
        playPulse(context, 96, startTime, 0.12, 0.12 * v, 'sine');
        playNoise(context, startTime, 0.12, 0.035 * v);
      } else {
        playPulse(context, 880, startTime, 0.045, 0.025 * v, 'square');
      }
      playPulse(context, 1320, startTime + beatDuration / 2, 0.035, 0.018 * v, 'square');
    }

    if (beat % 4 === 0 && isStemAudible('bass', stems, soloed)) {
      playPulse(context, root, startTime, beatDuration * 0.8, 0.045 * stems.bass.volume, 'triangle');
    } else if (beat % 4 === 2 && isStemAudible('keys', stems, soloed)) {
      playPulse(context, fifth, startTime, beatDuration * 0.6, 0.035 * stems.keys.volume, 'triangle');
    }

    sampleBeatRef.current = beat + 1;
  };

  const stopSamplePlayback = () => {
    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }
  };

  const startSamplePlayback = async (
    track: Track,
    resetBeat = false,
    playbackBpm = track.bpm
  ) => {
    const context = await unlockAudioContext();
    if (!context) return;

    stopSamplePlayback();
    if (resetBeat) sampleBeatRef.current = 0;
    scheduleSampleBeat(track, playbackBpm);
    sampleIntervalRef.current = window.setInterval(() => {
      scheduleSampleBeat(track, playbackBpm);
    }, 60 / playbackBpm * 1000);
  };

  const loadAudioBuffer = async (context: AudioContext, url: string) => {
    const cached = audioBufferCacheRef.current.get(url);
    if (cached) return cached;
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const decoded = await context.decodeAudioData(arrayBuffer);
    audioBufferCacheRef.current.set(url, decoded);
    return decoded;
  };

  const stopRealAudioPlayback = () => {
    const context = audioContextRef.current;
    const entries = Object.values(realStemSourcesRef.current);
    const anyEntry = entries[0];
    if (anyEntry && context && realStartContextTimeRef.current !== null) {
      const rate = anyEntry.source.playbackRate.value;
      const elapsed = (context.currentTime - realStartContextTimeRef.current) * rate;
      const bufferDuration = anyEntry.source.buffer?.duration ?? 0;
      realStartOffsetRef.current = bufferDuration > 0 ?
      (realStartOffsetRef.current + elapsed) % bufferDuration :
      0;
    }
    entries.forEach(({ source }) => {
      try {
        source.stop();
      } catch {
        // already stopped
      }
      source.disconnect();
    });
    realStemSourcesRef.current = {};
    realStartContextTimeRef.current = null;
  };

  const startRealAudioPlayback = async (
    track: Track,
    resetOffset = false,
    playbackBpm = track.bpm
  ) => {
    const stemUrls = track.stemAudioUrls;
    if (!stemUrls) return;
    const context = await unlockAudioContext();
    if (!context) return;

    let buffers: Partial<Record<StemId, AudioBuffer>>;
    try {
      const entries = await Promise.all(
        STEM_DEFS.map(async ({ id }) => {
          const url = stemUrls[id];
          if (!url) return null;
          return [id, await loadAudioBuffer(context, url)] as const;
        })
      );
      buffers = Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null));
    } catch {
      return;
    }
    if (Object.keys(buffers).length === 0) return;

    stopRealAudioPlayback();
    if (resetOffset) realStartOffsetRef.current = 0;

    const stems = stemsRef.current;
    const soloed = soloedStemIdsRef.current;
    const referenceBuffer = Object.values(buffers)[0] as AudioBuffer;
    const offset = realStartOffsetRef.current % referenceBuffer.duration;

    STEM_DEFS.forEach(({ id }) => {
      const buffer = buffers[id];
      if (!buffer) return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = playbackBpm / track.bpm;
      const gain = context.createGain();
      gain.gain.value = isStemAudible(id, stems, soloed) ? stems[id].volume : 0;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(0, offset);
      realStemSourcesRef.current[id] = { source, gain };
    });
    realStartContextTimeRef.current = context.currentTime;
  };

  const startTrackPlayback = async (
    track: Track,
    resetPosition = false,
    playbackBpm = track.bpm
  ) => {
    stopSamplePlayback();
    stopRealAudioPlayback();
    if (track.stemAudioUrls) {
      await startRealAudioPlayback(track, resetPosition, playbackBpm);
    } else {
      await startSamplePlayback(track, resetPosition, playbackBpm);
    }
  };

  const stopTrackPlayback = () => {
    stopSamplePlayback();
    stopRealAudioPlayback();
  };

  useEffect(() => {
    if (state.isPlaying && state.currentTrack) {
      progressInterval.current = window.setInterval(() => {
        setState((prev) => {
          if (!prev.currentTrack) return prev;
          const effectiveBpm = prev.playbackBpm ?? prev.currentTrack.bpm;
          const playbackRate = effectiveBpm / prev.currentTrack.bpm;
          const newTime = prev.currentTime + 0.1 * playbackRate; // Update every 100ms
          let newProgress = newTime / prev.currentTrack.duration;
          if (prev.isLooping && newProgress >= prev.loopEnd) {
            newProgress = prev.loopStart;
          } else if (newProgress >= 1) {
            stopTrackPlayback();
            return {
              ...prev,
              isPlaying: false,
              progress: 1,
              currentTime: prev.currentTrack.duration
            };
          }
          return {
            ...prev,
            currentTime: newProgress * prev.currentTrack.duration,
            progress: newProgress
          };
        });
      }, 100);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [state.isPlaying, state.currentTrack, state.isLooping, state.playbackBpm]);

  useEffect(() => {
    return () => {
      stopTrackPlayback();
      void audioContextRef.current?.close();
    };
  }, []);

  const playTrack = async (track: Track) => {
    const playbackBpm = state.playbackBpm ?? track.bpm;
    await startTrackPlayback(track, true, playbackBpm);
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      playbackBpm
    }));
  };
  const togglePlayPause = async () => {
    const nextIsPlaying = !state.isPlaying;

    if (state.currentTrack) {
      if (nextIsPlaying) {
        await startTrackPlayback(
          state.currentTrack,
          false,
          state.playbackBpm ?? state.currentTrack.bpm
        );
      } else {
        stopTrackPlayback();
      }
    }

    setState((prev) => {
      return {
        ...prev,
        isPlaying: nextIsPlaying
      };
    });
  };
  const stopTrack = () => {
    stopTrackPlayback();
    setState((prev) => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0,
      playbackBpm: null
    }));
  };
  const setPlaybackBpm = (bpm: number | null) => {
    setState((prev) => {
      if (prev.isPlaying && prev.currentTrack && bpm) {
        if (prev.currentTrack.stemAudioUrls) {
          const rate = bpm / prev.currentTrack.bpm;
          Object.values(realStemSourcesRef.current).forEach(({ source }) => {
            source.playbackRate.value = rate;
          });
        } else {
          void startSamplePlayback(prev.currentTrack, false, bpm);
        }
      }
      return {
        ...prev,
        playbackBpm: bpm
      };
    });
  };
  const seek = (progress: number) => {
    sampleBeatRef.current = 0;
    const track = state.currentTrack;
    if (track?.stemAudioUrls) {
      realStartOffsetRef.current = progress * track.duration;
      if (state.isPlaying) {
        void startRealAudioPlayback(track, false, state.playbackBpm ?? track.bpm);
      }
    }
    setState((prev) => ({
      ...prev,
      progress,
      currentTime: prev.currentTrack ?
      progress * prev.currentTrack.duration :
      0
    }));
  };
  const skipForward = () => {
    if (!state.currentTrack) return;
    const currentIndex = TRACKS.findIndex(
      (t) => t.id === state.currentTrack?.id
    );
    if (currentIndex < TRACKS.length - 1) {
      playTrack(TRACKS[currentIndex + 1]);
    }
  };
  const skipBackward = () => {
    if (!state.currentTrack) return;
    if (state.currentTime > 3) {
      seek(0);
    } else {
      const currentIndex = TRACKS.findIndex(
        (t) => t.id === state.currentTrack?.id
      );
      if (currentIndex > 0) {
        playTrack(TRACKS[currentIndex - 1]);
      }
    }
  };
  const toggleLoop = () => {
    setState((prev) => ({
      ...prev,
      isLooping: !prev.isLooping
    }));
  };
  const setLoopPoints = (start: number, end: number) => {
    setState((prev) => ({
      ...prev,
      loopStart: start,
      loopEnd: end
    }));
  };
  const toggleFavorite = (trackId: string) => {
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(trackId) ?
      prev.favorites.filter((id) => id !== trackId) :
      [...prev.favorites, trackId]
    }));
  };
  const setStemVolume = (stemId: StemId, volume: number) => {
    const clamped = Math.max(0, Math.min(1, volume));
    setState((prev) => ({
      ...prev,
      stems: {
        ...prev.stems,
        [stemId]: { ...prev.stems[stemId], volume: clamped }
      }
    }));
  };
  const toggleStemMute = (stemId: StemId) => {
    setState((prev) => ({
      ...prev,
      stems: {
        ...prev.stems,
        [stemId]: { ...prev.stems[stemId], muted: !prev.stems[stemId].muted }
      }
    }));
  };
  const toggleStemSolo = (stemId: StemId) => {
    setState((prev) => ({
      ...prev,
      soloedStemIds: prev.soloedStemIds.includes(stemId) ?
      prev.soloedStemIds.filter((id) => id !== stemId) :
      [...prev.soloedStemIds, stemId]
    }));
  };
  const resetStems = () => {
    setState((prev) => ({
      ...prev,
      stems: DEFAULT_STEMS,
      soloedStemIds: []
    }));
  };
  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playTrack,
        togglePlayPause,
        stopTrack,
        setPlaybackBpm,
        seek,
        skipForward,
        skipBackward,
        toggleLoop,
        setLoopPoints,
        toggleFavorite,
        setStemVolume,
        toggleStemMute,
        toggleStemSolo,
        resetStems
      }}>
      
      {children}
    </PlayerContext.Provider>);

}
export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
