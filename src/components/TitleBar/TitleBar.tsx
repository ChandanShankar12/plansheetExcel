'use client';

import { 
  ChevronDown,
} from 'lucide-react';
import { Button } from '../ui/button';
import { AioutlineSearch } from './AioutlineSearch';
import { ToggleSwitch } from '../ui/toggle-switch';
import { SaveButton } from '../ui/SaveButton';
import { Divider } from '../ui/divider';
import { memo, useState } from 'react';
import { useSpreadsheet } from '@/context/spreadsheet-context';

export const TitleBar = memo(function TitleBar() {
  const { activeSheet, setAutoSaveEnabled, autoSaveEnabled } = useSpreadsheet();
  
  const handleAutoSaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSaveEnabled(e.target.checked);
  };
  
  return (
    <div className="flex flex-row w-full items-center bg-[#E3E3E3] h-[35px] px-2">
      {/* Left section */}
      <div className="flex flex-row items-center gap-1">
        <SaveButton />
        <Divider />
        <span className="text-[12px] flex flex-row items-center gap-2">
          <ToggleSwitch checked={autoSaveEnabled} onChange={handleAutoSaveToggle} /> AutoSave
        </span>
      </div>

      {/* Center section */}
      <div className="flex-1 flex justify-center items-center">
        <AioutlineSearch />
      </div>

      {/* Right section */}
      <div className="flex flex-row items-center gap-1">
        {/* Sheet name */}
        <span className="text-[12px]">
          {activeSheet?.getName() || 'No sheet selected'}
        </span>
        
        {/* Language selector */}
        <div className="flex flex-row items-center gap-2 ml-4">
          <span className="text-[10px]">English</span>
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
});
