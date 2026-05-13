import React from 'react';
export function PhoneFrame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="min-h-screen w-full bg-neutral-100 flex items-center justify-center p-4 sm:p-8 font-sans text-neutral-900">
      <div className="relative w-full max-w-[390px] h-[844px] bg-white rounded-[48px] shadow-2xl overflow-hidden border-[8px] border-neutral-900 flex flex-col">
        {/* Status Bar Mock */}
        <div className="h-12 w-full flex justify-between items-center px-6 pt-2 pb-1 z-50 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0">
          <div className="text-[15px] font-semibold tracking-tight">9:41</div>
          {/* Dynamic Island Mock */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-[120px] h-[32px] bg-black rounded-full"></div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
            </svg>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden bg-[#FAFAFA]">
          {children}
        </div>

        {/* Home Indicator Mock */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-full z-50 pointer-events-none"></div>
      </div>
    </div>);

}