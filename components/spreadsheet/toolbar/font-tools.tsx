'use client';

import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline } from 'lucide-react';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import type { CellStyle } from '@/lib/spreadsheet/types';

export function FontTools() {
  const { activeCell, data, updateCell } = useSpreadsheetContext();

  const toggleStyle = (style: keyof CellStyle) => {
    if (!activeCell) return;
    const currentStyle = data[activeCell]?.style || {};
    updateCell(activeCell, {
      style: {
        ...currentStyle,
        [style]: !currentStyle[style]
      }
    });
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleStyle('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleStyle('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleStyle('underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
    </div>
  );
}