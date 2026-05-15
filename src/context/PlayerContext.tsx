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
  isLooping: boolean;
  loopStart: number; // 0 to 1
  loopEnd: number; // 0 to 1
  favorites: string[];
};
type PlayerContextType = PlayerState & {
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  stopTrack: () => void;
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
    isLooping: false,
    loopStart: 0,
    loopEnd: 1,
    favorites: ['t1', 't5'] // Mock initial favorites
  });
  const progressInterval = useRef<number | null>(null);
  useEffect(() => {
    if (state.isPlaying && state.currentTrack) {
      progressInterval.current = window.setInterval(() => {
        setState((prev) => {
          if (!prev.currentTrack) return prev;
          const newTime = prev.currentTime + 0.1; // Update every 100ms
          let newProgress = newTime / prev.currentTrack.duration;
          if (prev.isLooping && newProgress >= prev.loopEnd) {
            newProgress = prev.loopStart;
          } else if (newProgress >= 1) {
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
  }, [state.isPlaying, state.currentTrack, state.isLooping]);
  const playTrack = (track: Track) => {
    setState((prev) => ({
      ...prev,
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      currentTime: 0
    }));
  };
  const togglePlayPause = () => {
    setState((prev) => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }));
  };
  const stopTrack = () => {
    setState((prev) => ({
      ...prev,
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      currentTime: 0
    }));
  };
  const seek = (progress: number) => {
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
