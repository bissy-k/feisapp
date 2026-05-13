import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomTabs, Tab } from './components/BottomTabs';
import { MiniPlayer } from './components/MiniPlayer';
import { PlayerProvider } from './context/PlayerContext';
// Screens
import { HomeScreen } from './screens/HomeScreen';
import { BrowseScreen } from './screens/BrowseScreen';
import { StyleDetailScreen } from './screens/StyleDetailScreen';
import { NowPlayingScreen } from './screens/NowPlayingScreen';
import { FeisMinimalScreen } from './screens/FeisMinimalScreen';
import { SearchScreen } from './screens/SearchScreen';
import { LibraryScreen } from './screens/LibraryScreen';
function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  // Navigation State
  const [activeStyleId, setActiveStyleId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isFeisOpen, setIsFeisOpen] = useState(false);
  const handleNavigateToStyle = (styleId: string) => {
    setActiveStyleId(styleId);
  };
  const handleBack = () => {
    setActiveStyleId(null);
    setIsSearchOpen(false);
  };
  return (
    <PhoneFrame>
      <div className="relative w-full h-full overflow-hidden bg-[#FAFAFA]">
        {/* Main Tabs Content */}
        <div
          className="absolute inset-0"
          style={{
            display:
            activeTab === 'home' && !activeStyleId && !isSearchOpen ?
            'block' :
            'none'
          }}>
          
          <HomeScreen
            onNavigateToSearch={() => setIsSearchOpen(true)}
            onNavigateToStyle={handleNavigateToStyle}
            onNavigateToPractice={() => setActiveTab('practice')}
            onOpenFeis={() => setIsFeisOpen(true)} />
          
        </div>

        <div
          className="absolute inset-0"
          style={{
            display:
            activeTab === 'browse' && !activeStyleId ? 'block' : 'none'
          }}>
          
          <BrowseScreen onNavigateToStyle={handleNavigateToStyle} />
        </div>

        <div
          className="absolute inset-0"
          style={{
            display: activeTab === 'practice' ? 'block' : 'none'
          }}>
          
          <FeisMinimalScreen embedded />
        </div>

        <div
          className="absolute inset-0"
          style={{
            display: activeTab === 'library' ? 'block' : 'none'
          }}>
          
          <LibraryScreen />
        </div>

        {/* Stacked Screens */}
        {activeStyleId &&
        <div className="absolute inset-0 z-20 bg-white">
            <StyleDetailScreen styleId={activeStyleId} onBack={handleBack} />
          </div>
        }

        {isSearchOpen &&
        <div className="absolute inset-0 z-30 bg-white">
            <SearchScreen onBack={handleBack} />
          </div>
        }

        {/* Overlays */}
        <MiniPlayer onExpand={() => setIsNowPlayingOpen(true)} />

        <BottomTabs
          activeTab={activeTab}
          onChange={(tab) => {
            setActiveTab(tab);
            setActiveStyleId(null);
            setIsSearchOpen(false);
          }} />
        

        {/* Modals */}
        <AnimatePresence>
          {isNowPlayingOpen &&
          <NowPlayingScreen
            onClose={() => setIsNowPlayingOpen(false)}
            onOpenPractice={() => {
              setIsNowPlayingOpen(false);
              setIsFeisOpen(true);
            }} />

          }
          {isFeisOpen &&
          <FeisMinimalScreen onClose={() => setIsFeisOpen(false)} />
          }
        </AnimatePresence>
      </div>
    </PhoneFrame>);

}
export function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>);

}