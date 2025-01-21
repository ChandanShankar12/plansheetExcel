'use client';

import Image from 'next/image';
import { FloatingModal } from '../ai/floating_modal';
import { useState, useEffect } from 'react';

interface AsideWrapperProps {
  children: React.ReactNode;
}

function AsideWrapper({ children }: AsideWrapperProps) {
  const [isAsideOpen, setIsAsideOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'F1') {
        setIsAsideOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="flex flex-row flex-1">
      {children}
      <Aside isOpen={isAsideOpen} />
    </div>
  );
}

interface AsideProps {
  isOpen: boolean;
}

function Aside({ isOpen }: AsideProps) {
  return (
    <aside 
      className={`
        border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-[565px] h-full' : 'w-0 h-0 overflow-hidden'}
      `}
    >
      <div className={`
        flex flex-col h-full p-4 whitespace-nowrap m-2 bg-[#F7F7F7]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div className="flex flex-row gap-1 items-center justify-end w-full">
            <button className="flex items-center justify-center hover:bg-gray-200 rounded p-1">
              <Image src="/Icons/teenyicons_spreadsheet-solid.png" alt="Excel Icon" width={24} height={24} />
            </button>
            <button className="flex items-center justify-center hover:bg-gray-200 rounded p-1">
              <Image src="/Icons/teenyicons_spreadsheet-solid.png" alt="Excel Icon" width={24} height={24} />
            </button>
            <button className="flex items-center justify-center hover:bg-gray-200 rounded p-1">
              <Image src="/Icons/teenyicons_spreadsheet-solid.png" alt="Excel Icon" width={24} height={24} />
            </button>
          </div>
          <div className="flex-1">This is where the AI chat section will be</div>
          <div className="w-full">
            <FloatingModal isFloating={false} />
          </div>
        </div>
      </div>
    </aside>
  );
}

export { AsideWrapper, Aside };
