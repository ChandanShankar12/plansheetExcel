'use client';

import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CellStyle } from '@/server/models/cell';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
// import {FontTools} from '@/components/spreadsheet/toolbar/font-tools';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSpreadsheet } from '@/context/spreadsheet-context';
// import { FontSelector } from './font-selector';


export const Divider = () => (
  <div className="flex flex-row w-full">
    <div className="h-6 w-[1px] bg-gray-300 " />
  </div>
);

export function Toolbar() {
  const { 
    activeCell, 
    activeSheet,
    updateCell 
  } = useSpreadsheet();

  const [formulaValue, setFormulaValue] = useState('');
  const [isOverflowing, setIsOverflowing] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);



  const handleFormulaChange = (value: string) => {
    setFormulaValue(value);
  };

  

  useEffect(() => {
    const checkOverflow = () => {
      if (toolbarRef.current && contentRef.current) {
        setIsOverflowing(contentRef.current.scrollWidth > toolbarRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  const toolbarContent = (inDropdown = false) => (
    <div ref={!inDropdown ? contentRef : undefined} className="flex h-[48px] flex-row justify-between items-center rounded-l-[6px] border-gray-300 border w-full px-2 gap-4">
      {/* 1st group - Undo/Redo */}
      <div className="flex items-start gap-1 justify-center">
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
          <Image src="/Icons/Toolbar/1.svg" alt="Undo" width={16} height={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
          <Image src="/Icons/Toolbar/2.svg" alt="Redo" width={16} height={16} />
        </Button>
      </div>

      <Divider />

      {/* 2nd group - Font Tools */}
      <div className="flex items-center gap-1 w-full justify-center">
        {/* <FontTools /> */}
        {/* Font buttons */}
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
          <Image
            src="/Icons/Toolbar/3.svg"
            alt="Tool 3"
            width={12}
            height={12}
          />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
          <Image
            src="/Icons/Toolbar/4.svg"
            alt="Tool 4"
            width={12}
            height={12}
          />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-1.5">
          <Image
            src="/Icons/Toolbar/5.svg"
            alt="Tool 5"
            width={12}
            height={12}
          />
        </Button>
        {[6, 7, 8].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8 p-1.5">
            <Image
              src={`/Icons/Toolbar/${n}.svg`}
              alt={`Tool ${n}`}
              width={16}
              height={16}
            />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 3rd group - Alignment */}
      <div className="flex items-center gap-1 w-full justify-center ">
        {[9, 10, 11].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8 p-1.5">
            <Image
              src={`/Icons/Toolbar/${n}.svg`}
              alt={`Tool ${n}`}
              width={16}
              height={16}
            />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 4th group - Insert */}
      <div className="flex items-center gap-1 w-full justify-center">
        {[12, 13, 14, 15].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8 p-1.5">
            <Image
              src={`/Icons/Toolbar/${n}.svg`}
              alt={`Tool ${n}`}
              width={16}
              height={16}
            />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 5th group - Formula */}
      <div className="flex items-center justify-center gap-1 w-full ">
        <div className="relative items-center">
          <Input 
            className="h-8 w-42 sm:w-42 pl-8 pr-2" 
            placeholder="Formula" 
            value={formulaValue}
            onChange={(e) => handleFormulaChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
               
              }
            }}
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Image
              src="/Icons/Toolbar/16.svg"
              alt="Formula"
              width={16}
              height={16}
            />
          </div>
        </div>
        {[17, 18, 19].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8 p-1.5">
            <Image
              src={`/Icons/Toolbar/${n}.svg`}
              alt={`Tool ${n}`}
              width={16}
              height={16}
            />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 6th group - View */}
      <div className="flex items-center justify-center gap-1 w-full ">
        {[20, 21].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8 p-1.5">
            <Image
              src={`/Icons/Toolbar/${n}.svg`}
              alt={`Tool ${n}`}
              width={16}
              height={16}
            />
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      ref={toolbarRef}
      className="flex flex-row h-full w-full justify-center items-center bg-white"
    >
      {toolbarContent()}

      {isOverflowing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="h-full w-[14px] bg-[#B3B3B3] rounded-r-[6px] hover:bg-[#A0A0A0] transition-colors"
            >
              <ChevronDown className="h-4 w-4 text-white" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[400px] p-2">
            {toolbarContent(true)}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {!isOverflowing && (
        <div className="w-[14px] h-full bg-[#B3B3B3] rounded-r-[6px]" />
      )}
    </div>
  );
}
