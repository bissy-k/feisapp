import React from 'react';
import { Home, Search, PlaySquare, Music2, MoreHorizontal } from 'lucide-react';
export type Tab = 'home' | 'browse' | 'practice' | 'library';
interface BottomTabsProps {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}
export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
  const tabs = [
  {
    id: 'home',
    label: 'Home',
    icon: Home
  },
  {
    id: 'browse',
    label: 'Search',
    icon: Search
  },
  {
    id: 'library',
    label: 'My Music',
    icon: Music2
  },
  {
    id: 'practice',
    label: 'Metronome',
    icon: PlaySquare
  },
  {
    id: null,
    label: 'More',
    icon: MoreHorizontal
  }] as const;
  return (
    <div
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-[rgba(60,60,67,0.36)] pt-2 z-40"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)'
      }}>
      <div className="flex justify-between items-start mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id !== null && activeTab === tab.id;
          const selectTab = () => {
            if (tab.id) onChange(tab.id);
          };
          return (
            <button
              type="button"
              key={tab.label}
              onPointerDown={selectTab}
              onClick={selectTab}
              className="flex flex-col items-center justify-center flex-1 gap-1 relative pt-0">
              
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-colors duration-200 ${isActive ? 'text-[#E56D56]' : 'text-[#666666]'}`}
                  strokeWidth={isActive ? 2.2 : 2} />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-[-0.24px] transition-colors duration-200 ${isActive ? 'text-[#E56D56]' : 'text-[#666666]'}`}>
                
                {tab.label}
              </span>
            </button>);

        })}
      </div>
    </div>);

}
