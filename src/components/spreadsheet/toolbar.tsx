'use client';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { CellData } from '@/lib/spreadsheet/types';

interface ToolbarProps {
  activeCell: string | null;
  data: Record<string, CellData>;
  setData: (data: Record<string, CellData> | ((prev: Record<string, CellData>) => Record<string, CellData>)) => void;
}

export function Toolbar({ activeCell, data, setData }: ToolbarProps) {
  const handleFormulaChange = (value: string) => {
    if (activeCell) {
      setData((prev) => ({
        ...prev,
        [activeCell]: {
          value,
          style: prev[activeCell]?.style || {}
        }
      }));
    }
  };

  return (
    <div className="flex items-center space-x-2 ml-4">
      <Input
        value={activeCell ? data[activeCell]?.value || '' : ''}
        onChange={(e) => handleFormulaChange(e.target.value)}
        className="w-96"
        placeholder="Enter value or formula (e.g., =A1+B1)"
      />
      <div className="border-l h-6 mx-2" />
      <Button variant="ghost" size="icon">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <Italic className="h-4 w-4" />
      </Button>
      <div className="border-l h-6 mx-2" />
      <Button variant="ghost" size="icon">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  );
}