import React from 'react';
export function PhoneFrame({ children }: {children: React.ReactNode;}) {
  return (
    <div className="h-screen w-full bg-[#FAFAFA] font-sans text-neutral-900">
      <div className="relative mx-auto w-full max-w-[390px] h-full overflow-hidden bg-[#FAFAFA]">
        {children}
      </div>
    </div>);

}
