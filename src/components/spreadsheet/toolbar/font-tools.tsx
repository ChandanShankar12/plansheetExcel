'use client';

import { Button } from '@/components/ui/button';
import { Type, Bold, Italic, Underline } from 'lucide-react';
import { ToolbarSection } from './toolbar-section';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { CellStyle } from '@/lib/spreadsheet/types';

export function FontTools() {
  const { activeCell, data, updateCell } = useSpreadsheetContext();

  const toggleStyle = (style: keyof CellStyle) => {
    if (!activeCell) return;
    const currentStyle = data[activeCell]?.style || {};
    updateCell(activeCell, {
      style: { ...currentStyle, [style]: !currentStyle[style] }
    });
  };

  const updateFont = (value: string) => {
    if (!activeCell) return;
    const currentStyle = data[activeCell]?.style || {};
    updateCell(activeCell, {
      style: { ...currentStyle, fontFamily: value }
    });
  };

  const updateFontSize = (value: string) => {
    if (!activeCell) return;
    const currentStyle = data[activeCell]?.style || {};
    updateCell(activeCell, {
      style: { ...currentStyle, fontSize: parseInt(value) }
    });
  };

  return (
    <>
      <ToolbarSection border={false}>
        
        <select
          className="h-8 w-24 rounded-md border border-input bg-background px-2 text-sm"
          onChange={(e) => updateFont(e.target.value)}
          value={data[activeCell!]?.style?.fontFamily || 'Arial'}
        >
          <option>Arial</option>
          <option>Times New Roman</option>
          <option>Calibri</option>
        </select>
        <select
          className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
          onChange={(e) => updateFontSize(e.target.value)}
          value={data[activeCell!]?.style?.fontSize || '11'}
        >
          <option>11</option>
          <option>12</option>
          <option>14</option>
          <option>16</option>
        </select>
      </ToolbarSection>
      
    </>
  );
}