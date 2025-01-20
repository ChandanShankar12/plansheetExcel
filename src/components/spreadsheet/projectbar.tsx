'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Settings2, Search, LayoutGrid } from 'lucide-react';
import { ToggleSliding } from '../ui/toggle-sliding';

export function ProjectBar() {
  return (
    <div className="flex w-full flex-row h-[32px] justify-between items-center bg-white">
      {/* Left Section - Title */}
      <div className="inline-flex items-center gap-3 ">
        <div>
        <Image
          src="/Icons/teenyicons_spreadsheet-solid.png"
          alt="Excel Icon"
          width={24}
          height={24}
        />
        </div>
        <div className="flex flex-row gap-1 items-end bottom-0">
          <span className="text-[18px] text-[#303030] font-inter font-normal tracking-[0.54px]">
            Untitled Project
          <span className="ml-2 text-xs text-gray-400 bottom-0">(unsaved)</span></span>
        </div>
      </div>

     <ToggleSliding/>

      {/* Right Section - Actions */}
      <div className="flex flex-row items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Image src="/Icons/Frame.svg" alt="Settings" width={32} height={32} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Image src="/Icons/ix_connector-filled.svg" alt="Settings" width={32} height={32} />
        </Button>
      </div>
    </div>
  );
}
