'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Settings2, 
  Search, 
  LayoutGrid,
  RefreshCw,
  Maximize,
  FileSpreadsheet
} from 'lucide-react';
import { ToggleSliding } from '../ui/toggle-sliding';
import { memo } from 'react';

export const ProjectBar = memo(function ProjectBar() {
  return (
    <div className="flex w-full flex-row h-[32px] justify-between items-center bg-white">
      {/* Left Section - Title */}
      <div className="inline-flex items-center gap-3">
        <div>
          <FileSpreadsheet className="w-6 h-6 text-gray-700" />
        </div>
        <div className="flex flex-row gap-1 items-end bottom-0">
          <span className="text-[18px] text-[#303030] font-inter font-normal tracking-[0.54px]">
            Untitled Project
            <span className="ml-2 text-xs text-gray-400 bottom-0">(unsaved)</span>
          </span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex flex-row items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
