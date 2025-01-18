'use client';

import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CellData } from '@/lib/spreadsheet/types';
import { FontTools } from './toolbar/font-tools';




interface ToolbarProps {
  activeCell: string | null;
  data: Record<string, CellData>;
  setData: (
    data:
      | Record<string, CellData>
      | ((prev: Record<string, CellData>) => Record<string, CellData>)
  ) => void;
  setFont: {};
}

export const Divider = () => (
  <div className="h-6 w-[1px] bg-gray-200" />
);

export function Toolbar({ activeCell, data, setData, setFont}: ToolbarProps) {
  const handleFormulaChange = (value: string) => {
    if (activeCell) {
      setData((prev) => ({
        ...prev,
        [activeCell]: {
          value,
          style: prev[activeCell]?.style || {},
        },
      }));
    }
  };

 

  return (
    <div className="flex flex-row items-center justify-between gap-4 p-2 bg-white border border-gray-200 rounded-md">
      {/* 1st div./- Icons 1-2 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/1.svg`} alt="Icon 1" width={18} height={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/2.svg`} alt="Icon 2" width={18} height={18} />
        </Button>
      </div>

      <Divider />

      {/* 2nd div - Input and icons 3-8 */}
      <div className="flex items-center gap-2">
        <FontTools />
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/3.svg`} alt="Icon 3" width={13} height={13} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/4.svg`} alt="Icon 4" width={14} height={14} />
        </Button>
        <Button variant="ghost" size="icon">
            <Image src={`/Icons/Toolbar/5.svg`} alt="Icon 5" width={12} height={12} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/6.svg`} alt="Icon 6" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/7.svg`} alt="Icon 7" width={18} height={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/8.svg`} alt="Icon 8" width={18} height={18} />
        </Button>
      </div>

      <Divider />

      {/* 3rd div./- Icons 9-11 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/9.svg`} alt="Icon 9" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/10.svg`} alt="Icon 10" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/11.svg`} alt="Icon 11" width={20} height={20} />
        </Button>
      </div>

      <Divider />

      {/* 4th div./- Icons 12-15 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/12.svg`} alt="Icon 12" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/13.svg`} alt="Icon 13" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/14.svg`} alt="Icon 14" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/15.svg`} alt="Icon 15" width={20} height={20} />
        </Button>
      </div>

      <Divider />

      {/* 5th div - Input with icon 16 and icons 17-19 */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            className="h-8 w-32 pl-8"
            placeholder="Enter text"
          />
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Image src={`/Icons/Toolbar/16.svg`} alt="Icon 16" width={16} height={16} />
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/17.svg`} alt="Icon 17" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
            <Image src={`/Icons/Toolbar/18.svg`} alt="Icon 18" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/19.svg`} alt="Icon 19" width={20} height={20} />
        </Button>
      </div>

      <Divider />

      {/* 6th div./- Icons 20-21 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/20.svg`} alt="Icon 20" width={20} height={20} />
        </Button>
        <Button variant="ghost" size="icon">
          <Image src={`/Icons/Toolbar/21.svg`} alt="Icon 21" width={20} height={20} />
        </Button>
      </div>
    </div>
  );
}
