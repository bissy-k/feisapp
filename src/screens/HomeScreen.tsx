import React from 'react';
import { Search, Play, Clock, Sparkles } from 'lucide-react';
import {
  TRACKS,
  DANCE_STYLES,
  RECENTLY_PLAYED_IDS,
  RECOMMENDED_IDS } from
'../data/mockData';
import { TrackRow } from '../components/TrackRow';
interface HomeScreenProps {
  onNavigateToSearch: () => void;
  onNavigateToStyle: (styleId: string) => void;
  onNavigateToPractice: () => void;
  onOpenFeis?: () => void;
}
export function HomeScreen({
  onNavigateToSearch,
  onNavigateToStyle,
  onNavigateToPractice,
  onOpenFeis
}: HomeScreenProps) {
  const recentlyPlayed = RECENTLY_PLAYED_IDS.map(
    (id) => TRACKS.find((t) => t.id === id)!
  ).filter(Boolean);
  const recommended = RECOMMENDED_IDS.map(
    (id) => TRACKS.find((t) => t.id === id)!
  ).filter(Boolean);
  const popularStyles = DANCE_STYLES.slice(0, 4);
  return (
    <div className="h-full overflow-y-auto pb-32 pt-14 px-4 bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Home
        </h1>
        <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-semibold">
          DN
        </div>
      </div>

      {/* Search Bar */}
      <div
        onClick={onNavigateToSearch}
        className="bg-white rounded-xl h-12 flex items-center px-4 gap-3 shadow-sm border border-neutral-100 mb-8 cursor-text">
        
        <Search size={20} className="text-neutral-400" />
        <span className="text-[17px] text-neutral-400">
          Search styles, tracks...
        </span>
      </div>

      {/* Practice Shortcuts */}
      <section className="mb-8">
        <h2 className="text-[20px] font-bold text-neutral-900 mb-4 tracking-tight">
          Practice Shortcuts
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenFeis ?? onNavigateToPractice}
            className="bg-[#14b8a6] text-white p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform shadow-sm">
            
            <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center">
              <Play size={20} fill="currentColor" className="ml-1" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-[16px]">Quick Drill</div>
              <div className="text-white/80 text-[13px] mt-0.5">
                Reel • 113 BPM
              </div>
            </div>
          </button>
          <button
            onClick={onNavigateToPractice}
            className="bg-white border border-neutral-200 text-neutral-900 p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform shadow-sm">
            
            <div className="bg-neutral-100 w-10 h-10 rounded-full flex items-center justify-center text-neutral-600">
              <Clock size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-[16px]">Metronome</div>
              <div className="text-neutral-500 text-[13px] mt-0.5">
                Standalone
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Popular Styles */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-neutral-900 tracking-tight">
            Popular Styles
          </h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x hide-scrollbar">
          {popularStyles.map((style) =>
          <div
            key={style.id}
            onClick={() => onNavigateToStyle(style.id)}
            className="flex-shrink-0 w-[140px] aspect-square rounded-2xl p-4 flex flex-col justify-end relative overflow-hidden cursor-pointer snap-start"
            style={{
              backgroundColor: style.color
            }}>
            
              <div className="absolute inset-0 bg-black/10" />
              <h3 className="text-white font-bold text-lg relative z-10">
                {style.name}
              </h3>
            </div>
          )}
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-8">
        <h2 className="text-[20px] font-bold text-neutral-900 mb-4 tracking-tight">
          Recently Played
        </h2>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {recentlyPlayed.map((track, i) =>
          <TrackRow key={track.id} track={track} />
          )}
        </div>
      </section>

      {/* Recommended */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-[#14b8a6]" />
          <h2 className="text-[20px] font-bold text-neutral-900 tracking-tight">
            Recommended for You
          </h2>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {recommended.map((track, i) =>
          <TrackRow key={track.id} track={track} />
          )}
        </div>
      </section>
    </div>);

}