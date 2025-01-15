'use client';

import { Button } from '@/components/ui/button';
import { Scissors, Copy, Clipboard } from 'lucide-react';
import { ToolbarSection } from './toolbar-section';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';

export function ClipboardTools() {
  const { cutCells, copyCells, pasteCells } = useSpreadsheetContext();

  return (
    <ToolbarSection>
      <Button variant="ghost" size="icon" className="rounded-none" onClick={cutCells}>
        <Scissors className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-none" onClick={copyCells}>
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-none" onClick={pasteCells}>
        <Clipboard className="h-4 w-4" />
      </Button>
    </ToolbarSection>
  );
}