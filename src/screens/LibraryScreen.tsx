import React, { useState } from 'react';
import { Settings, Heart, Download, Clock, ListMusic } from 'lucide-react';
import { PLAYLISTS, TRACKS } from '../data/mockData';
import { usePlayer } from '../context/PlayerContext';
import { TrackRow } from '../components/TrackRow';
export function LibraryScreen() {
  const [activeTab, setActiveTab] = useState<'playlists' | 'favorites'>(
    'playlists'
  );
  const { favorites } = usePlayer();
  const favoriteTracks = favorites.
  map((id) => TRACKS.find((t) => t.id === id)!).
  filter(Boolean);
  return (
    <div className="h-full overflow-y-auto scrollbar-none pb-32 pt-14 px-4 bg-[#FAFAFA]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Library
        </h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-neutral-900 active:bg-neutral-200 transition-colors">
          <Settings size={24} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <button className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-3 active:bg-neutral-50 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
            <Heart size={20} fill="currentColor" />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[16px] text-neutral-900">
              Favorites
            </div>
            <div className="text-[13px] text-neutral-500">
              {favorites.length} tracks
            </div>
          </div>
        </button>
        <button className="bg-white border border-neutral-200 p-4 rounded-2xl flex items-center gap-3 active:bg-neutral-50 transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
            <Download size={20} />
          </div>
          <div className="text-left">
            <div className="font-semibold text-[16px] text-neutral-900">
              Downloaded
            </div>
            <div className="text-[13px] text-neutral-500">12 tracks</div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-neutral-200 mb-6">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`pb-3 font-semibold text-[16px] transition-colors relative ${activeTab === 'playlists' ? 'text-neutral-900' : 'text-neutral-400'}`}>
          
          Playlists
          {activeTab === 'playlists' &&
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14b8a6] rounded-t-full" />
          }
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 font-semibold text-[16px] transition-colors relative ${activeTab === 'favorites' ? 'text-neutral-900' : 'text-neutral-400'}`}>
          
          Favorites
          {activeTab === 'favorites' &&
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14b8a6] rounded-t-full" />
          }
        </button>
      </div>

      {/* Content */}
      {activeTab === 'playlists' ?
      <div className="flex flex-col gap-4">
          {PLAYLISTS.map((playlist) =>
        <div
          key={playlist.id}
          className="flex items-center gap-4 active:scale-[0.98] transition-transform cursor-pointer">
          
              <div
            className="w-20 h-20 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{
              backgroundColor: playlist.coverColor
            }}>
            
                <ListMusic size={32} className="text-white/80" />
              </div>
              <div className="flex-1 border-b border-neutral-100 py-4">
                <h3 className="font-semibold text-[17px] text-neutral-900 mb-1">
                  {playlist.name}
                </h3>
                <p className="text-[14px] text-neutral-500">
                  {playlist.trackIds.length} tracks
                </p>
              </div>
            </div>
        )}
        </div> :

      <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
          {favoriteTracks.length > 0 ?
        favoriteTracks.map((track) =>
        <TrackRow key={track.id} track={track} />
        ) :

        <div className="p-8 text-center text-neutral-500">
              No favorites yet.
            </div>
        }
        </div>
      }
    </div>);

}
