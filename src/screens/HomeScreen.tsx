import React from 'react';
import {
  ShoppingBag,
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

const ACCENT = '#E56D56';
const BG = '#FBF6F3';
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#1C170D';
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

// Static — this is a display-only card, no tap/press affordance.
function RecentTrackCard({ track }: { track: Track }) {
  return (
    <div
      className="flex-shrink-0 w-[280px] snap-start rounded-2xl shadow-sm p-3 flex items-center gap-3"
      style={{ backgroundColor: CARD_BG }}>

      <div
        className="w-14 h-14 rounded-xl flex-shrink-0"
        style={{ backgroundColor: track.artworkColor }} />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-semibold truncate" style={{ color: TEXT_PRIMARY }}>
          {track.title}
        </div>
        <div className="flex items-center gap-1.5 text-[12px] mt-0.5" style={{ color: TEXT_TERTIARY }}>
          <Download size={11} />
          <span className="truncate">{track.artist}</span>
        </div>
      </div>
      <MoreHorizontal size={18} style={{ color: TEXT_TERTIARY }} />
    </div>);

}

// Static — no onClick, plain div rather than button, no press affordance.
function PhotoCard({
  label,
  color,
  icon,
  height = 96
}: {
  label: string;
  color: string;
  icon: React.ReactNode;
  height?: number;
}) {
  return (
    <div className="flex-shrink-0 w-[136px] snap-start">
      <div
        className="w-full rounded-2xl relative overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: color, height }}>

        {icon}
      </div>
      <div className="text-[14px] font-medium mt-2 truncate" style={{ color: TEXT_PRIMARY }}>
        {label}
      </div>
    </div>);

}

// Home is intentionally static: a display-only overview with no navigation
// out of it. Tempo remains the only interactive destination in the app
// right now, reached via the bottom tab bar.
export function HomeScreen() {
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
        <div className="flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: ACCENT }}>
          <ShoppingBag size={18} />
          Shop
        </div>
      </div>

      {/* Recently Played */}
      <section className="mb-8">
        <SectionHeader title="Recently Played" />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {recentlyPlayed.map((track) =>
          <RecentTrackCard key={track.id} track={track} />
          )}
        </div>
      </section>

      {/* Irish Dance Music Types */}
      <section className="mb-8">
        <SectionHeader title="Irish Dance Music Types" />
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 snap-x hide-scrollbar">
          {musicTypes.map((style) =>
          <PhotoCard
            key={style.id}
            label={style.name}
            color={style.color}
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
        <SectionHeader title="Featured Tracks" />
        <div className="rounded-2xl shadow-sm overflow-hidden" style={{ backgroundColor: CARD_BG }}>
          {featured.map((track) =>
          <TrackRow key={track.id} track={track} interactive={false} />
          )}
        </div>
      </section>

      {/* Ceili */}
      <section className="mb-8">
        <SectionHeader title="Ceili" />
        <div
          className="w-full h-[160px] rounded-2xl relative overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#5EAE96' }}>

          <PartyPopper size={40} className="text-white/70" strokeWidth={1.5} />
        </div>
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
