'use client';

import { Input } from '@/components/ui/input';
import { HistoryTools } from './toolbar/history-tools';
import { ClipboardTools } from './toolbar/clipboard-tools';
import { FontTools } from './toolbar/font-tools';
import { NumberTools } from './toolbar/number-tools';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';

export function FormulaBar() {
  const { activeCell, data, updateCell } = useSpreadsheetContext();
  const cellData = activeCell ? data[activeCell] || { value: '', style: {} } : { value: '', style: {} };

  const handleValueChange = (value: string) => {
    if (!activeCell) return;
    updateCell(activeCell, { value });
  };

  return (
    <div className="flex flex-col border-b">
      <div className="flex items-center gap-2 p-2 bg-background">
        <HistoryTools />
        <div className="h-6 border-l" />
        <ClipboardTools />
        <div className="h-6 border-l" />
        <FontTools />
        <div className="h-6 border-l" />
        <NumberTools />
      </div>
      <div className="flex items-center gap-2 p-2 bg-background border-t">
        <div className="w-10 text-sm text-muted-foreground">fx</div>
        <Input
          value={cellData.value}
          onChange={(e) => handleValueChange(e.target.value)}
          className="flex-1 font-mono"
          placeholder="Enter value or formula (e.g., =SUM(A1:A10))"
        />
      </div>
    </div>
  );
}