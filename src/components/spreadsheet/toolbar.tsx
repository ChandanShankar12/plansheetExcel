'use client';

import Image from 'next/image';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { CellData } from '@/lib/spreadsheet/types';

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
  <div className="h-6 w-[1px] bg-gray-200 shrink-0" />
);

export function Toolbar({ activeCell, data, setData, setFont }: ToolbarProps) {
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
    <div className="flex flex-row h-[32px] w-full items-center gap-2 mx-4 bg-white border-b border-gray-200">
      {/* 1st group - Undo/Redo */}
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Image src="/Icons/Toolbar/1.svg" alt="Undo" width={18} height={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Image src="/Icons/Toolbar/2.svg" alt="Redo" width={18} height={18} />
        </Button>
      </div>

      <Divider />

      {/* 2nd group - Font Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <Input className="h-8 w-32" placeholder="Font" />
        {/* Font buttons */}
        {[3, 4, 5, 6, 7, 8].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8">
            <Image src={`/Icons/Toolbar/${n}.svg`} alt={`Tool ${n}`} width={16} height={16} />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 3rd group - Alignment */}
      <div className="flex items-center gap-2 shrink-0">
        {[9, 10, 11].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8">
            <Image src={`/Icons/Toolbar/${n}.svg`} alt={`Tool ${n}`} width={16} height={16} />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 4th group - Insert */}
      <div className="flex items-center gap-2 shrink-0">
        {[12, 13, 14, 15].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8">
            <Image src={`/Icons/Toolbar/${n}.svg`} alt={`Tool ${n}`} width={16} height={16} />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 5th group - Formula */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <Input className="h-8 w-32 pl-8" placeholder="Formula" />
          <div className="absolute left-2 top-1/2 -translate-y-1/2">
            <Image src="/Icons/Toolbar/16.svg" alt="Formula" width={16} height={16} />
          </div>
        </div>
        {[17, 18, 19].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8">
            <Image src={`/Icons/Toolbar/${n}.svg`} alt={`Tool ${n}`} width={16} height={16} />
          </Button>
        ))}
      </div>

      <Divider />

      {/* 6th group - View */}
      <div className="flex items-center gap-2 shrink-0">
        {[20, 21].map((n) => (
          <Button key={n} variant="ghost" size="icon" className="h-8 w-8">
            <Image src={`/Icons/Toolbar/${n}.svg`} alt={`Tool ${n}`} width={16} height={16} />
          </Button>
        ))}
      </div>
    </div>
  );
}
