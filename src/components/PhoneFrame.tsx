import React from 'react';
export function PhoneFrame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="h-[100dvh] w-full bg-[#FAFAFA] font-sans text-neutral-900 overflow-hidden">
      <div
        className="phone-shell relative mx-auto w-full max-w-[390px] overflow-hidden bg-[#FAFAFA]">
        <div className="absolute left-0 right-0 top-0 z-[80] h-[54px] bg-white/90 backdrop-blur-md pointer-events-none">
          <div className="relative flex h-full items-center justify-between px-6 pt-2 text-black">
            <div className="text-[17px] font-semibold leading-[22px] tracking-[-0.4px]">
              9:41
            </div>
            <div className="absolute left-1/2 top-2 h-8 w-[120px] -translate-x-1/2 rounded-full bg-black" />
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
              </svg>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>);

}
