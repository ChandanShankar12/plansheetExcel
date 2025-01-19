'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Settings2, Search, LayoutGrid } from 'lucide-react';

export function ProjectBar() {
  return (
    <div className="flex flex-row justify-between items-center h-10 px-2 border-b border-gray-200 bg-white">
      {/* Left Section - Title */}
      <div className="flex items-center gap-2">
        <Image 
          src="/Icons/excel.svg" 
          alt="Excel Icon" 
          width={20} 
          height={20}
        />
        <span className="text-sm text-gray-600">Untitled Project</span>
        <span className="text-xs text-gray-400">(unsaved)</span>
      </div>

      {/* Center Section - Navigation */}
      <div className="flex gap-1">
        <Button variant="default" className="bg-primaryColor hover:bg-primaryColor/90 h-7 text-xs rounded-none px-4">
          Home
        </Button>
        <Button variant="ghost" className="h-7 text-xs text-gray-600 rounded-none px-4">
          Data
        </Button>
        <Button variant="ghost" className="h-7 text-xs text-gray-600 rounded-none px-4">
          Analysis
        </Button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Settings2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
