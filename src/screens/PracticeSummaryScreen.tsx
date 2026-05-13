import React from 'react';
import {
  Check,
  Clock,
  Activity,
  Music,
  Award,
  ChevronRight } from
'lucide-react';
import { motion } from 'framer-motion';
import { TimeSignaturePattern } from '../components/TimeSignaturePattern';
interface PracticeSummaryScreenProps {
  stats: any;
  onDone: () => void;
}
export function PracticeSummaryScreen({
  stats,
  onDone
}: PracticeSummaryScreenProps) {
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s} sec`;
    return `${m} min ${s} sec`;
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95
      }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      className="absolute inset-0 z-50 bg-[#FAFAFA] text-neutral-900 flex flex-col overflow-y-auto">
      
      <div className="flex-1 px-6 pt-16 pb-8 flex flex-col items-center">
        <motion.div
          initial={{
            scale: 0
          }}
          animate={{
            scale: 1
          }}
          transition={{
            type: 'spring',
            delay: 0.2
          }}
          className="w-24 h-24 bg-[#14b8a6] rounded-full flex items-center justify-center text-white mb-6 shadow-[0_10px_30px_rgba(20,184,166,0.3)]">
          
          <Check size={48} strokeWidth={3} />
        </motion.div>

        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Practice Complete
        </h1>
        <p className="text-neutral-500 mb-10">Great job staying consistent!</p>

        {/* Stats Card */}
        <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 mb-8">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Duration
                </span>
              </div>
              <div className="text-xl font-bold">
                {formatDuration(stats.duration)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-neutral-400 mb-1">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Avg BPM
                </span>
              </div>
              <div className="text-xl font-bold">{stats.avgBpm}</div>
            </div>
            <div className="col-span-2 pt-4 border-t border-neutral-100">
              <div className="flex items-center gap-2 text-neutral-400 mb-2">
                <Music size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Track
                </span>
              </div>
              <div className="flex items-center gap-3">
                {stats.track ?
                <>
                    <div
                    className="w-10 h-10 rounded-lg"
                    style={{
                      backgroundColor: stats.track.artworkColor
                    }} />
                  
                    <div>
                      <div className="font-bold">{stats.track.title}</div>
                      <div className="text-sm text-neutral-500">
                        {stats.track.artist}
                      </div>
                    </div>
                  </> :

                <div className="font-bold">Metronome Only</div>
                }
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="w-full mb-8">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
            Achievements Earned
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex-shrink-0 w-36 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                <Award size={24} />
              </div>
              <div className="font-bold text-sm mb-1">On Tempo</div>
              <div className="text-xs text-neutral-500">Steady BPM</div>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex-shrink-0 w-36 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mb-3">
                <Activity size={24} />
              </div>
              <div className="font-bold text-sm mb-1">
                {stats.beatsPlayed} Beats
              </div>
              <div className="text-xs text-neutral-500">Total played</div>
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div className="w-full bg-neutral-900 text-white rounded-2xl p-5 flex items-center justify-between mb-8 active:scale-95 transition-transform cursor-pointer">
          <div>
            <div className="text-xs font-bold text-[#14b8a6] uppercase tracking-wider mb-1">
              Suggested Next
            </div>
            <div className="font-bold">
              Try tempo: {Math.min(200, stats.avgBpm + 5)} BPM
            </div>
          </div>
          <ChevronRight size={24} className="text-neutral-500" />
        </div>

        <button
          onClick={onDone}
          className="w-full bg-neutral-200 text-neutral-900 h-14 rounded-2xl font-bold text-lg active:scale-95 transition-transform mt-auto">
          
          Done
        </button>
      </div>
    </motion.div>);

}