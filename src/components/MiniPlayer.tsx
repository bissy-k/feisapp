import React from 'react';
import { Play, Pause, Forward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayer } from '../context/PlayerContext';
interface MiniPlayerProps {
  onExpand: () => void;
}
export function MiniPlayer({ onExpand }: MiniPlayerProps) {
  const { currentTrack, isPlaying, togglePlayPause, skipForward, progress } =
  usePlayer();
  if (!currentTrack) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{
          y: 100,
          opacity: 0
        }}
        animate={{
          y: 0,
          opacity: 1
        }}
        exit={{
          y: 100,
          opacity: 0
        }}
        className="absolute bottom-[84px] left-2 right-2 z-40">
        
        <div
          className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-neutral-200/50 overflow-hidden cursor-pointer"
          onClick={onExpand}>
          
          <div className="flex items-center p-2 gap-3">
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0 shadow-sm"
              style={{
                backgroundColor: currentTrack.artworkColor
              }} />
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[15px] font-semibold text-neutral-900 truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[13px] text-neutral-500 truncate">
                {currentTrack.artist}
              </p>
            </div>
            <div
              className="flex items-center gap-2 pr-2"
              onClick={(e) => e.stopPropagation()}>
              
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 flex items-center justify-center text-neutral-900 active:scale-95 transition-transform"
                aria-label={isPlaying ? 'Pause' : 'Play'}>
                
                {isPlaying ?
                <Pause size={24} fill="currentColor" /> :

                <Play size={24} fill="currentColor" className="ml-1" />
                }
              </button>
              <button
                onClick={skipForward}
                className="w-10 h-10 flex items-center justify-center text-neutral-900 active:scale-95 transition-transform"
                aria-label="Next track">
                
                <Forward size={24} fill="currentColor" />
              </button>
            </div>
          </div>
          {/* Progress Line */}
          <div className="h-[2px] bg-neutral-100 w-full absolute bottom-0 left-0">
            <div
              className="h-full bg-neutral-800 transition-all duration-100 ease-linear"
              style={{
                width: `${progress * 100}%`
              }} />
            
          </div>
        </div>
      </motion.div>
    </AnimatePresence>);

}