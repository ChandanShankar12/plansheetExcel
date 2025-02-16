'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Sheet } from '@/server/models/sheet';

export function SheetsBar() {
  const { 
    activeSheet, 
    sheets, 
    addSheet, 
    setActiveSheet,
    spreadsheet 
  } = useSpreadsheetContext();
  
  const [editingSheet, setEditingSheet] = useState<number | null>(null);
  const [newSheetName, setNewSheetName] = useState('');

  useEffect(() => {
    if (sheets.length === 0) {
      addSheet('Sheet 1');
    }
  }, [sheets.length, addSheet]);

  const handleAddSheet = () => {
    const sheetNumber = sheets.length + 1;
    const baseName = 'Sheet ';
    let newName = `${baseName}${sheetNumber}`;
    
    while (sheets.some(sheet => sheet.name === newName)) {
      newName = `${baseName}${sheetNumber + 1}`;
    }

    const newSheet = addSheet(newName);
    setActiveSheet(newSheet);
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
