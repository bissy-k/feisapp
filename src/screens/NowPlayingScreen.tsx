import React from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Heart,
  Share,
  SlidersHorizontal } from
'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
import { Scrubber } from '../components/Scrubber';
interface NowPlayingScreenProps {
  onClose: () => void;
  onOpenPractice: () => void;
}
export function NowPlayingScreen({
  onClose,
  onOpenPractice
}: NowPlayingScreenProps) {
  const {
    currentTrack,
    isPlaying,
    togglePlayPause,
    skipForward,
    skipBackward,
    progress,
    seek,
    isLooping,
    toggleLoop,
    favorites,
    toggleFavorite
  } = usePlayer();
  if (!currentTrack) return null;
  const isFavorite = favorites.includes(currentTrack.id);
  return (
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
        damping: 25,
        stiffness: 200
      }}
      className="absolute inset-0 z-50 bg-white flex flex-col">
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={onClose}
          className="p-2 text-neutral-900 active:opacity-70">
          
          <ChevronDown size={32} />
        </button>
        <div className="text-[13px] font-semibold text-neutral-500 uppercase tracking-widest">
          Now Playing
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 px-8 flex flex-col">
        {/* Artwork */}
        <div
          className="w-full aspect-square rounded-3xl shadow-2xl mb-8 mt-4 transition-transform duration-500 ease-out"
          style={{
            backgroundColor: currentTrack.artworkColor,
            transform: isPlaying ? 'scale(1)' : 'scale(0.9)'
          }} />
        

        {/* Info */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-neutral-900 truncate mb-1">
              {currentTrack.title}
            </h2>
            <p className="text-[18px] text-[#14b8a6] truncate">
              {currentTrack.artist}
            </p>
          </div>
          <button
            onClick={() => toggleFavorite(currentTrack.id)}
            className="p-2 -mr-2 text-neutral-900 active:scale-90 transition-transform"
            aria-label="Toggle favorite">
            
            <Heart
              size={28}
              fill={isFavorite ? 'currentColor' : 'none'}
              className={isFavorite ? 'text-red-500' : ''} />
            
          </button>
        </div>

        {/* Scrubber */}
        <div className="mb-8">
          <Scrubber
            progress={progress}
            duration={currentTrack.duration}
            onSeek={seek} />
          
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-10">
          <button
            onClick={toggleLoop}
            className={`p-3 rounded-full transition-colors ${isLooping ? 'bg-neutral-100 text-[#14b8a6]' : 'text-neutral-400'}`}
            aria-label="Toggle loop">
            
            <Repeat size={24} />
          </button>

          <div className="flex items-center gap-6">
            <button
              onClick={skipBackward}
              className="text-neutral-900 active:scale-90 transition-transform">
              
              <SkipBack size={40} fill="currentColor" />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-20 h-20 bg-neutral-900 text-white rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg">
              
              {isPlaying ?
              <Pause size={36} fill="currentColor" /> :

              <Play size={36} fill="currentColor" className="ml-2" />
              }
            </button>
            <button
              onClick={skipForward}
              className="text-neutral-900 active:scale-90 transition-transform">
              
              <SkipForward size={40} fill="currentColor" />
            </button>
          </div>

          <button className="p-3 text-neutral-400 active:text-neutral-900 transition-colors">
            <Share size={24} />
          </button>
        </div>

        {/* Practice Mode CTA */}
        <div className="mt-auto mb-10">
          <button
            onClick={onOpenPractice}
            className="w-full bg-[#14b8a6]/10 text-[#14b8a6] h-14 rounded-2xl flex items-center justify-center gap-2 font-semibold text-[17px] active:scale-95 transition-transform">
            
            <SlidersHorizontal size={20} />
            Open Practice Mode
          </button>
        </div>
      </div>
    </motion.div>);

}