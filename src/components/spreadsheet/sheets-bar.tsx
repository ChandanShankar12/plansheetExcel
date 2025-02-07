'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

interface Sheet {
  id: number;
  name: string;
}

export function SheetsBar() {
  const { activeSheetId, setActiveSheetId, sheets, addSheet } = useSpreadsheetContext();
  const [editingSheet, setEditingSheet] = useState<number | null>(null);
  const [newSheetName, setNewSheetName] = useState('');

  useEffect(() => {
    if (sheets.length === 0) {
      addSheet('Sheet1');
    }
  }, [sheets.length, addSheet]);

  const handleAddSheet = () => {
    const newSheetName = `Sheet${sheets.length + 1}`;
    addSheet(newSheetName);
  };

  const handleSheetClick = (sheetId: number) => {
    setActiveSheetId(sheetId);
  };

  const handleDoubleClick = (sheet: Sheet) => {
    setEditingSheet(sheet.id);
    setNewSheetName(sheet.name);
  };

  const handleNameChange = (e: React.KeyboardEvent<HTMLInputElement>, sheet: Sheet) => {
    if (e.key === 'Enter') {
      // Update sheet name logic here
      setEditingSheet(null);
    }
  };

  return (
    <div className="flex items-center h-8 bg-[#f8f9fa] border-t">
      <div className="flex items-center space-x-1 px-2 overflow-x-auto">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            onClick={() => handleSheetClick(sheet.id)}
            onDoubleClick={() => handleDoubleClick(sheet)}
            className={`
              flex items-center px-3 py-1 min-w-[100px] max-w-[200px]
              text-sm cursor-pointer select-none
              ${activeSheetId === sheet.id 
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
