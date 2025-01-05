'use client';

import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { ToolbarSection } from './toolbar-section';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';

export function HistoryTools() {
  const { undo, redo } = useSpreadsheetContext();

  return (
    <ToolbarSection>
      <Button variant="ghost" size="icon" className="rounded-none" onClick={undo}>
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" className="rounded-none" onClick={redo}>
        <Redo2 className="h-4 w-4" />
      </Button>
    </ToolbarSection>
  );
}