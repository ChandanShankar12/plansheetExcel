'use client';

import Image from 'next/image';
import { FloatingModal } from '../ai/floating_modal';
import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Input } from '../ui/input';
import { 
  Paperclip,
  Send,
  FileSpreadsheet
} from 'lucide-react';

interface AsideWrapperProps {
  children: React.ReactNode;
}

// Create a stable event handler
const useKeyboardShortcut = (callback: () => void) => {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.key === 'F1' || event.key === 'f1')) {
        event.preventDefault();
        savedCallback.current();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
};

// Memoize the wrapper to prevent re-renders
export const AsideWrapper = memo(function AsideWrapper({ children }: AsideWrapperProps) {
  const [isAsideOpen, setIsAsideOpen] = useState(false);
  
  useKeyboardShortcut(() => setIsAsideOpen(prev => !prev));

  return (
    <div className="flex flex-row flex-1 relative">
      <div className="flex-1">{children}</div>
    </div>
  );
});

// Memoize the Aside component
export const Aside = memo(function Aside() {
  const [isOpen, setIsOpen] = useState(false);
  
  useKeyboardShortcut(() => setIsOpen(prev => !prev));

  return (
    <aside 
      className={`
        border-l border-gray-200
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-[400px]' : 'w-0'}
        overflow-hidden
        shrink-0
      `}
    >
      <div 
        className={`
          h-full w-[400px]
          transition-all duration-300 ease-in-out
          transform
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Hi, How can I help you today?</span>
          </div>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <Image src="/Icons/refresh.svg" alt="Refresh" width={16} height={16} />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Image src="/Icons/settings.svg" alt="Settings" width={16} height={16} />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <Image src="/Icons/maximize.svg" alt="Maximize" width={16} height={16} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-auto p-4">
          {/* User Message */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="bg-gray-100 rounded-lg p-3 max-w-[80%] self-end">
              What is the supervisor name of booth 456?
            </div>
            <span className="text-xs text-gray-500 self-end">2:15PM</span>
          </div>

          {/* Assistant Message */}
          <div className="flex flex-col gap-2">
            <div className="bg-green-50 rounded-lg p-3 max-w-[80%]">
              The name of Booth Number 456 supervisor is "Seema Choudhary".
            </div>
            <span className="text-xs text-gray-500">2:15PM</span>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="relative">
            <Input 
              placeholder="I need the data from column E in the chart."
              className="pr-24 py-2"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button>
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>
              <button>
                <Send className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <FileSpreadsheet className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500">All Sheets</span>
          </div>
        </div>
      </div>
    </aside>
  );
});
