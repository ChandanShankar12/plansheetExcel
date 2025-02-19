'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { Sheet } from '@/server/models/sheet';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export function SheetsBar() {
  const { spreadsheet, addSheet, activeSheet, setActiveSheet } = useSpreadsheetContext();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [editingSheet, setEditingSheet] = useState<number | null>(null);
  const [newSheetName, setNewSheetName] = useState('');

  // Update local sheets state when spreadsheet changes
  useEffect(() => {
    if (spreadsheet) {
      setSheets(spreadsheet.getAllSheets());
    }
  }, [spreadsheet]);

  // Create initial sheet if none exists
  useEffect(() => {
    if (sheets && sheets.length === 0) {
      addSheet('Sheet 1');
    }
  }, [sheets, addSheet]);

  const handleAddSheet = () => {
    const sheetNumber = sheets ? sheets.length + 1 : 1;
    addSheet(`Sheet ${sheetNumber}`);
  };

  const handleSheetClick = (sheet: Sheet) => {
    setActiveSheet(sheet);
  };

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingSheet(sheet.id);
    setNewSheetName(sheet.name);
  };

  const handleNameChange = (e: React.KeyboardEvent<HTMLInputElement>, sheet: Sheet) => {
    if (e.key === 'Enter') {
      const newName = newSheetName.trim();
      if (newName && newName !== sheet.name) {
        sheet.name = newName;
        setEditingSheet(null);
      }
    } else if (e.key === 'Escape') {
      setEditingSheet(null);
    }
  };

  if (!spreadsheet) return null;

  return (
    <div className="flex items-center h-8 bg-[#f8f9fa] border-t">
      <div className="flex items-center space-x-1 px-2 overflow-x-auto">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            onClick={() => handleSheetClick(sheet)}
            onDoubleClick={() => handleDoubleClick(sheet)}
            className={`
              flex items-center px-3 py-1 min-w-[100px] max-w-[200px]
              text-sm cursor-pointer select-none
              ${activeSheet.id === sheet.id 
                ? 'bg-white border-t-2 border-t-green-700 border-x' 
                : 'hover:bg-gray-100'}
            `}
          >
            {editingSheet === sheet.id ? (
              <input
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onKeyDown={(e) => handleNameChange(e, sheet)}
                onBlur={() => setEditingSheet(null)}
                className="w-full outline-none bg-transparent"
                autoFocus
              />
            ) : (
              <span className="truncate">{sheet.name}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleAddSheet}
        className="p-1 hover:bg-gray-200 rounded-sm"
        title="Add Sheet"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
