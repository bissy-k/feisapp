import React from 'react';
import { DANCE_STYLES } from '../data/mockData';
import { StyleCard } from '../components/StyleCard';
interface BrowseScreenProps {
  onNavigateToStyle: (styleId: string) => void;
}
export function BrowseScreen({ onNavigateToStyle }: BrowseScreenProps) {
  return (
    <div className="h-full overflow-y-auto pb-32 pt-14 px-4 bg-[#FAFAFA]">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-6">
        Browse
      </h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {DANCE_STYLES.map((style) =>
        <StyleCard
          key={style.id}
          style={style}
          onClick={() => onNavigateToStyle(style.id)} />

        )}
      </div>

      <section className="mb-8">
        <h2 className="text-[20px] font-bold text-neutral-900 mb-4 tracking-tight">
          Browse by Level
        </h2>
        <div className="flex flex-col gap-3">
          {['Beginner', 'Primary', 'Intermediate', 'Open'].map((level) =>
          <button
            key={level}
            className="bg-white border border-neutral-200 p-4 rounded-xl flex items-center justify-between active:bg-neutral-50 transition-colors">
            
              <span className="font-semibold text-[17px] text-neutral-900">
                {level}
              </span>
              <svg
              className="w-5 h-5 text-neutral-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2">
              
                <path
                d="M9 18l6-6-6-6"
                strokeLinecap="round"
                strokeLinejoin="round" />
              
              </svg>
            </button>
          )}
        </div>
      </section>
    </div>);

}