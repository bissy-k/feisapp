import React from 'react';
import { ChevronLeft, Play, Shuffle } from 'lucide-react';
import { DANCE_STYLES, TRACKS } from '../data/mockData';
import { TrackRow } from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';
interface StyleDetailScreenProps {
  styleId: string;
  onBack: () => void;
}
export function StyleDetailScreen({ styleId, onBack }: StyleDetailScreenProps) {
  const style = DANCE_STYLES.find((s) => s.id === styleId);
  const tracks = TRACKS.filter((t) => t.styleId === styleId);
  const { playTrack } = usePlayer();
  if (!style) return null;
  return (
    <div className="h-full overflow-y-auto scrollbar-none pb-32 bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FAFAFA]/90 backdrop-blur-md px-2 pt-12 pb-2 flex items-center">
        <button
          onClick={onBack}
          className="p-2 text-[#14b8a6] flex items-center gap-1 active:opacity-70"
          aria-label="Go back">
          
          <ChevronLeft size={28} />
          <span className="text-[17px] font-medium -ml-1">Back</span>
        </button>
      </div>

      {/* Hero */}
      <div className="px-4 pt-4 pb-6">
        <div
          className="w-full aspect-square max-h-[240px] rounded-2xl shadow-md mb-6 relative overflow-hidden"
          style={{
            backgroundColor: style.color
          }}>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
              {style.name}
            </h1>
            <p className="text-white/90 text-[15px]">{style.description}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => tracks[0] && playTrack(tracks[0])}
            className="flex-1 bg-neutral-900 text-white h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-[16px] active:scale-95 transition-transform">
            
            <Play size={20} fill="currentColor" />
            Play
          </button>
          <button
            onClick={() =>
            tracks[0] &&
            playTrack(tracks[Math.floor(Math.random() * tracks.length)])
            }
            className="flex-1 bg-neutral-200 text-neutral-900 h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-[16px] active:scale-95 transition-transform">
            
            <Shuffle size={20} />
            Shuffle
          </button>
        </div>

        <div className="flex items-center justify-between mb-2 px-2">
          <span className="text-[13px] font-semibold text-neutral-500 uppercase tracking-wider">
            {tracks.length} Tracks
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {tracks.map((track, i) =>
          <TrackRow
            key={track.id}
            track={track}
            index={i}
            showArtwork={false} />

          )}
        </div>
      </div>
    </div>);

}
