import React from 'react';
import { Home, Search, PlaySquare, Library, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
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
    label: 'Browse',
    icon: Compass
  },
  {
    id: 'practice',
    label: 'Practice',
    icon: PlaySquare
  },
  {
    id: 'library',
    label: 'Library',
    icon: Library
  }] as
  const;
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-neutral-200 pb-8 pt-2 px-4 z-40">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center w-16 gap-1 relative">
              
              <div className="relative">
                <Icon
                  size={24}
                  className={`transition-colors duration-200 ${isActive ? 'text-[#14b8a6]' : 'text-neutral-400'}`}
                  strokeWidth={isActive ? 2.5 : 2} />
                
                {isActive &&
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -inset-2 bg-[#14b8a6]/10 rounded-xl -z-10"
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }} />

                }
              </div>
              <span
                className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-[#14b8a6]' : 'text-neutral-500'}`}>
                
                {tab.label}
              </span>
            </button>);

        })}
      </div>
    </div>);

}