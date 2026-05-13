import React from 'react';
import { MoreHorizontal, Play } from 'lucide-react';
import { Track } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
interface TrackRowProps {
  track: Track;
  index?: number;
  showArtwork?: boolean;
}
export function TrackRow({ track, index, showArtwork = true }: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  const handlePlay = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  return (
    <div
      onClick={handlePlay}
      className="flex items-center gap-3 py-2 px-4 active:bg-neutral-100 transition-colors cursor-pointer group">
      
      {index !== undefined && !showArtwork &&
      <span className="text-[15px] font-medium text-neutral-400 w-6 text-center">
          {isCurrent && isPlaying ?
        <div className="flex items-end justify-center gap-[2px] h-4">
              <div className="w-[3px] h-2 bg-[#14b8a6] animate-pulse" />
              <div className="w-[3px] h-4 bg-[#14b8a6] animate-pulse delay-75" />
              <div className="w-[3px] h-3 bg-[#14b8a6] animate-pulse delay-150" />
            </div> :

        index + 1
        }
        </span>
      }

      {showArtwork &&
      <div
        className="w-12 h-12 rounded-md flex-shrink-0 relative overflow-hidden"
        style={{
          backgroundColor: track.artworkColor
        }}>
        
          {isCurrent && isPlaying &&
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="flex items-end justify-center gap-[2px] h-4">
                <div className="w-[3px] h-2 bg-white animate-pulse" />
                <div className="w-[3px] h-4 bg-white animate-pulse delay-75" />
                <div className="w-[3px] h-3 bg-white animate-pulse delay-150" />
              </div>
            </div>
        }
        </div>
      }

      <div className="flex-1 min-w-0 border-b border-neutral-100 pb-2 pt-1">
        <h4
          className={`text-[16px] font-medium truncate ${isCurrent ? 'text-[#14b8a6]' : 'text-neutral-900'}`}>
          
          {track.title}
        </h4>
        <div className="flex items-center gap-2 text-[13px] text-neutral-500 truncate mt-0.5">
          <span>{track.artist}</span>
          <span>•</span>
          <span>{track.bpm} BPM</span>
        </div>
      </div>

      <div className="flex items-center gap-3 border-b border-neutral-100 pb-2 pt-1">
        <span className="text-[13px] text-neutral-400">
          {formatDuration(track.duration)}
        </span>
        <button
          className="p-1 text-neutral-400 active:text-neutral-900"
          onClick={(e) => e.stopPropagation()}>
          
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>);

}