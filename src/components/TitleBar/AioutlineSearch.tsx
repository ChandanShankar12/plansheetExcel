'use client';

import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useCallback } from 'react';

export const AioutlineSearch = () => {
  const { activeSheet } = useSpreadsheet();

  const handleSearch = useCallback((query: string) => {
    // Implement search logic here
  }, []);

  return (
    <div className="relative">
      {/* Search Bar */}
      <div className="flex flex-row items-center gap-2">
        <div className="w-[20px] h-[20px]">
          <Search className="w-5 h-5 text-gray-500" />
        </div>
        <div className="w-[400px]">
          <Input 
            placeholder={`Search in ${activeSheet?.getName() || 'sheet'}`}
            className="h-[25px] text-[10px] px-2 bg-white"
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: '48px' }}>
        {/* <ToggleSliding /> */}
      </div>
    </div>
  );
};
