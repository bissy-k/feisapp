import React, { useState } from 'react';
import { Search, X, ChevronLeft } from 'lucide-react';
import { TRACKS, DANCE_STYLES } from '../data/mockData';
import { TrackRow } from '../components/TrackRow';
interface SearchScreenProps {
  onBack: () => void;
}
export function SearchScreen({ onBack }: SearchScreenProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const filters = ['Reel', 'Jig', 'Hornpipe', 'Beginner', 'Heavy Shoe'];
  const results =
  query.length > 1 ?
  TRACKS.filter(
    (t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) ||
    t.artist.toLowerCase().includes(query.toLowerCase())
  ) :
  [];
  return (
    <div className="h-full bg-[#FAFAFA] flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-white border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-neutral-900">
            <ChevronLeft size={28} />
          </button>
          <div className="flex-1 bg-neutral-100 rounded-xl h-10 flex items-center px-3 gap-2">
            <Search size={18} className="text-neutral-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks, styles..."
              className="bg-transparent border-none outline-none flex-1 text-[16px] text-neutral-900 placeholder:text-neutral-400" />
            
            {query &&
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400">
              
                <X size={16} />
              </button>
            }
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar mt-4 pb-1">
          {filters.map((f) =>
          <button
            key={f}
            onClick={() => setActiveFilter(activeFilter === f ? null : f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-medium transition-colors ${activeFilter === f ? 'bg-[#14b8a6] text-white' : 'bg-neutral-100 text-neutral-600'}`}>
            
              {f}
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {query.length > 1 ?
        results.length > 0 ?
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              {results.map((track) =>
          <TrackRow key={track.id} track={track} />
          )}
            </div> :

        <div className="text-center text-neutral-500 mt-10">
              No results found for "{query}"
            </div> :


        <div>
            <h3 className="font-semibold text-[18px] text-neutral-900 mb-4">
              Recent Searches
            </h3>
            <div className="flex flex-col gap-4">
              {['The Butterfly', 'Slip Jig 113 BPM', 'Comhaltas'].map((s) =>
            <div
              key={s}
              className="flex items-center gap-3 text-neutral-600 active:bg-neutral-100 p-2 -mx-2 rounded-lg cursor-pointer">
              
                  <Search size={18} className="text-neutral-400" />
                  <span className="text-[16px]">{s}</span>
                </div>
            )}
            </div>
          </div>
        }
      </div>
    </div>);

}