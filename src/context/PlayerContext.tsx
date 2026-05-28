import React, {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext } from
'react';
import { Track, TRACKS } from '../data/mockData';
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
    favorites: ['t1', 't5'] // Mock initial favorites
  });
  const progressInterval = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sampleIntervalRef = useRef<number | null>(null);
  const sampleBeatRef = useRef(0);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext ||
      (window as Window & {webkitAudioContext?: typeof AudioContext;}).webkitAudioContext;
      if (!AudioContextConstructor) return null;
      audioContextRef.current = new AudioContextConstructor();
    }
    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
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

    if (beat % 4 === 0) {
      playPulse(context, 72, startTime, 0.18, 0.18, 'sine');
      playPulse(context, root, startTime, beatDuration * 0.8, 0.045, 'triangle');
    } else if (beat % 4 === 2) {
      playPulse(context, 96, startTime, 0.12, 0.12, 'sine');
      playNoise(context, startTime, 0.12, 0.035);
      playPulse(context, fifth, startTime, beatDuration * 0.6, 0.035, 'triangle');
    } else {
      playPulse(context, 880, startTime, 0.045, 0.025, 'square');
    }

    playPulse(context, 1320, startTime + beatDuration / 2, 0.035, 0.018, 'square');
    sampleBeatRef.current = beat + 1;
  };

  const stopSamplePlayback = () => {
    if (sampleIntervalRef.current) {
      clearInterval(sampleIntervalRef.current);
      sampleIntervalRef.current = null;
    }
  };

  const startSamplePlayback = (
    track: Track,
    resetBeat = false,
    playbackBpm = track.bpm
  ) => {
    stopSamplePlayback();
    if (resetBeat) sampleBeatRef.current = 0;
    scheduleSampleBeat(track, playbackBpm);
    sampleIntervalRef.current = window.setInterval(() => {
      scheduleSampleBeat(track, playbackBpm);
    }, 60 / playbackBpm * 1000);
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
            stopSamplePlayback();
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
      stopSamplePlayback();
      void audioContextRef.current?.close();
    };
  }, []);

  const playTrack = (track: Track) => {
    const playbackBpm = state.playbackBpm ?? track.bpm;
    startSamplePlayback(track, true, playbackBpm);
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      currentTime: 0,
      playbackBpm
    }));
  };
  const togglePlayPause = () => {
    setState((prev) => {
      const nextIsPlaying = !prev.isPlaying;
      if (prev.currentTrack) {
        if (nextIsPlaying) {
          startSamplePlayback(
            prev.currentTrack,
            false,
            prev.playbackBpm ?? prev.currentTrack.bpm
          );
        } else {
          stopSamplePlayback();
        }
      }
      return {
        ...prev,
        isPlaying: nextIsPlaying
      };
    });
  };
  const stopTrack = () => {
    stopSamplePlayback();
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
        startSamplePlayback(prev.currentTrack, false, bpm);
      }
      return {
        ...prev,
        playbackBpm: bpm
      };
    });
  };
  const seek = (progress: number) => {
    sampleBeatRef.current = 0;
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
        toggleFavorite
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
