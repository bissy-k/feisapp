import React from 'react';
import {
  ShoppingBag,
  Play,
  Clock,
  Download,
  MoreHorizontal,
  Music2,
  PartyPopper
} from 'lucide-react';
import {
  TRACKS,
  Track,
  DANCE_STYLES,
  DANCE_LEVELS,
  ARTISTS,
  OTHER_MUSIC_CATEGORIES,
  RECENTLY_PLAYED_IDS,
  FEATURED_IDS } from
'../data/mockData';
import { TrackRow } from '../components/TrackRow';
import { usePlayer } from '../context/PlayerContext';

interface HomeScreenProps {
  onNavigateToSearch: () => void;
  onNavigateToStyle: (styleId: string) => void;
  onNavigateToPractice: () => void;
  onOpenFeis?: (presetId?: string) => void;
}

const ACCENT = '#E56D56';
const BG = '#FBF6F3';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1C170D';
const TEXT_SECONDARY = '#666666';
const TEXT_TERTIARY = '#8A8580';
const TRACK_TINT = '#F0E7E1';

function SectionHeader({
  title,
  onViewAll
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-[18px] font-bold tracking-tight" style={{ color: TEXT_PRIMARY }}>
        {title}
      </h2>
      {onViewAll &&
      <button
        onClick={onViewAll}
        className="text-[13px] font-semibold"
        style={{ color: ACCENT }}>

          View all
        </button>
      }
    </div>);

}

function RecentTrackCard({ track }: { track: Track }) {
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = usePlayer();
  const isCurrent = currentTrack?.id === track.id;
  const handlePlay = () => {
    if (isCurrent) togglePlayPause();else
    playTrack(track);
  };
  return (
    <div
      onClick={handlePlay}
      className="flex-shrink-0 w-[280px] snap-start rounded-2xl shadow-sm p-3 flex items-center gap-3 active:bg-neutral-50 transition-colors cursor-pointer"
      style={{ backgroundColor: CARD_BG }}>

      <div
        className="w-14 h-14 rounded-xl flex-shrink-0 relative overflow-hidden"
        style={{ backgroundColor: track.artworkColor }}>

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
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>
          {track.title}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] mt-0.5" style={{ color: TEXT_TERTIARY }}>
          <Download size={11} />
          <span className="truncate">{track.artist}</span>
        </div>
      </div>
      <button
        onClick={(event) => event.stopPropagation()}
        className="p-1 flex-shrink-0"
        style={{ color: TEXT_TERTIARY }}
        aria-label="More options">

        <MoreHorizontal size={18} />
      </button>
    </div>);

}

function PhotoCard({
  label,
  color,
  icon,
  onClick,
  height = 96
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  onClick?: () => void;
  height?: number;
}) {
  return (
    <div className="flex-shrink-0 w-[136px] snap-start">
      <button
        onClick={onClick}
        className="w-full rounded-2xl relative overflow-hidden flex items-center justify-center active:scale-95 transition-transform"
        style={{ backgroundColor: color, height }}>

        {icon}
      </button>
      <div className="text-[14px] font-medium mt-2 truncate" style={{ color: TEXT_PRIMARY }}>
        {label}
      </div>
    </div>);

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
  const featured = FEATURED_IDS.map(
    (id) => TRACKS.find((t) => t.id === id)!
  ).filter(Boolean);
  const musicTypes = DANCE_STYLES.slice(0, 6);

  return (
    <div
      className="h-full overflow-y-auto scrollbar-none pb-48 pt-14 px-4"
      style={{ backgroundColor: BG }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-[26px] font-bold tracking-tight" style={{ color: TEXT_PRIMARY }}>
          Hi Joe,
        </h1>
        <button
          className="flex items-center gap-1.5 text-[14px] font-semibold"
          style={{ color: ACCENT }}>

          <ShoppingBag size={18} />
          Shop
        </button>
      </div>

      {/* Practice Shortcuts */}
      <section className="mb-8">
        <SectionHeader title="Practice Shortcuts" />
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (onOpenFeis) {
                onOpenFeis('reel');
                return;
              }
              onNavigateToPractice();
            }}
            className="text-white p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform shadow-sm"
            style={{ backgroundColor: ACCENT }}>

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
            className="p-4 rounded-2xl flex flex-col gap-3 active:scale-95 transition-transform shadow-sm border"
            style={{ backgroundColor: CARD_BG, borderColor: TRACK_TINT, color: TEXT_PRIMARY }}>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: TRACK_TINT, color: TEXT_SECONDARY }}>

              <Clock size={20} />
            </div>
            <div className="text-left">
              <div className="font-semibold text-[16px]">Tempo</div>
              <div className="text-[13px] mt-0.5" style={{ color: TEXT_SECONDARY }}>
                Standalone
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Recently Played */}
      <section className="mb-8">
        <SectionHeader title="Recently Played" onViewAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {recentlyPlayed.map((track) =>
          <RecentTrackCard key={track.id} track={track} />
          )}
        </div>
      </section>

      {/* Irish Dance Music Types */}
      <section className="mb-8">
        <SectionHeader title="Irish Dance Music Types" onViewAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {musicTypes.map((style) =>
          <PhotoCard
            key={style.id}
            label={style.name}
            color={style.color}
            onClick={() => onNavigateToStyle(style.id)}
            icon={<Music2 size={28} className="text-white/70" strokeWidth={1.5} />} />

          )}
        </div>
      </section>

      {/* Irish Dance Levels */}
      <section className="mb-8">
        <SectionHeader title="Irish Dance Levels" />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {DANCE_LEVELS.map((level) =>
          <div
            key={level.id}
            className="flex-shrink-0 w-[148px] rounded-xl p-3.5 shadow-sm snap-start overflow-hidden relative"
            style={{ backgroundColor: CARD_BG }}>

              <div
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: level.color }} />

              <div className="text-[14px] font-semibold" style={{ color: TEXT_PRIMARY }}>
                {level.name}
              </div>
              <div className="text-[12px] mt-0.5" style={{ color: TEXT_TERTIARY }}>
                {level.gaelicName}
              </div>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: level.totalSegments }).map((_, index) =>
              <div
                key={index}
                className="h-1 flex-1 rounded-full"
                style={{
                  backgroundColor: index < level.filledSegments ?
                  level.color :
                  TRACK_TINT
                }} />

              )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Browse Artists */}
      <section className="mb-8">
        <SectionHeader title="Browse Artists" />
        <div className="flex gap-4 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {ARTISTS.map((artist) => {
            const initials = artist.name.
            split(' ').
            map((part) => part[0]).
            slice(0, 2).
            join('');
            return (
              <div
                key={artist.id}
                className="flex-shrink-0 w-[68px] flex flex-col items-center snap-start">

                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-[16px]"
                  style={{ backgroundColor: artist.color }}>

                  {initials}
                </div>
                <div
                  className="text-[12px] mt-2 text-center truncate w-full"
                  style={{ color: TEXT_PRIMARY }}>

                  {artist.name}
                </div>
              </div>);

          })}
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="mb-8">
        <SectionHeader title="Featured Tracks" onViewAll={() => {}} />
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: CARD_BG }}>
          {featured.map((track) =>
          <TrackRow key={track.id} track={track} />
          )}
        </div>
      </section>

      {/* Ceili */}
      <section className="mb-8">
        <SectionHeader title="Ceili" />
        <button
          className="w-full h-[160px] rounded-2xl relative overflow-hidden flex items-center justify-center active:scale-95 transition-transform"
          style={{ backgroundColor: '#5EAE96' }}>

          <PartyPopper size={40} className="text-white/70" strokeWidth={1.5} />
        </button>
      </section>

      {/* Other Music */}
      <section className="mb-8">
        <SectionHeader title="Other Music" />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {OTHER_MUSIC_CATEGORIES.map((category) =>
          <PhotoCard
            key={category.id}
            label={category.name}
            color={category.color}
            icon={<Music2 size={26} className="text-white/70" strokeWidth={1.5} />} />

          )}
        </div>
      </section>
    </div>);

}
