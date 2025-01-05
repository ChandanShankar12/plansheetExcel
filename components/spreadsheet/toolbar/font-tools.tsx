'use client';

import { Button } from '@/components/ui/button';
import { Type, Bold, Italic, Underline } from 'lucide-react';
import { ToolbarSection } from './toolbar-section';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';

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
      style: { ...currentStyle, fontSize: value }
    });
  };

  return (
    <>
      <ToolbarSection border={false}>
        <Type className="h-4 w-4" />
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
      <ToolbarSection>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none"
          onClick={() => toggleStyle('bold')}
          data-active={data[activeCell!]?.style?.bold}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none"
          onClick={() => toggleStyle('italic')}
          data-active={data[activeCell!]?.style?.italic}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-none"
          onClick={() => toggleStyle('underline')}
          data-active={data[activeCell!]?.style?.underline}
        >
          <Underline className="h-4 w-4" />
        </Button>
      </ToolbarSection>
    </>
  );
}