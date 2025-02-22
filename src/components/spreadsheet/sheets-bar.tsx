'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { Sheet } from '@/server/models/sheet';
import { useState } from 'react';

export function SheetsBar() {
  const { sheets, activeSheet, addSheet, switchSheet } = useSpreadsheet();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSheet = async () => {
    if (isAdding) return;
    
    try {
      setIsAdding(true);
      const newSheet = await addSheet();
      if (newSheet) {
        console.log('Added sheet to workbook:', newSheet.getId());
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleSheetClick = async (sheet: Sheet) => {
    if (sheet.getId() === activeSheet?.getId()) return;
    console.log('Switching to sheet:', sheet.getId());
    await switchSheet(sheet);
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-background border-t">
      {sheets.map((sheet) => (
        <button
          key={sheet.getId()}
          onClick={() => handleSheetClick(sheet)}
          className={`px-4 py-1 rounded ${
            activeSheet?.getId() === sheet.getId()
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          {sheet.getName()}
        </button>
      ))}
      <button
        onClick={handleAddSheet}
        disabled={isAdding}
        className="px-4 py-1 rounded bg-secondary hover:bg-secondary/80 disabled:opacity-50"
      >
        +
      </button>
    </div>
  );
}
