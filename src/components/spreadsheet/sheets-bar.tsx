'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { Sheet } from '@/server/models/sheets';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import axios from 'axios';

export function SheetsBar() {
  const { spreadsheet, addSheet, activeSheet, setActiveSheet } = useSpreadsheetContext();
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [editingSheet, setEditingSheet] = useState<number | null>(null);
  const [newSheetName, setNewSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Update sheets list when spreadsheet or active sheet changes
  useEffect(() => {
    if (spreadsheet) {
      setSheets(spreadsheet.getAllSheets());
    }
  }, [spreadsheet, activeSheet]);

  const handleAddSheet = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newSheet = await addSheet();
      if (newSheet) {
        // Update local state immediately
        setSheets(spreadsheet.getAllSheets());
        // Switch to new sheet
        setActiveSheet(newSheet);
      }
    } catch (error) {
      console.error('Failed to add sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSheetClick = async (sheet: Sheet) => {
    if (isLoading || sheet.id === activeSheet?.id) return;
    
    setIsLoading(true);
    try {
      await setActiveSheet(sheet);
    } catch (error) {
      console.error('Failed to switch sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoubleClick = (sheet: Sheet) => {
    if (isLoading) return;
    setEditingSheet(sheet.id);
    setNewSheetName(sheet.name);
  };

  const handleNameChange = async (e: React.KeyboardEvent<HTMLInputElement>, sheet: Sheet) => {
    if (e.key === 'Enter') {
      const newName = newSheetName.trim();
      if (newName && newName !== sheet.name && !isLoading) {
        setIsLoading(true);
        try {
          await axios.post('/api/sheets', {
            sheetId: sheet.id,
            name: newName
          });
          
          sheet.setName(newName);
          setSheets([...sheets]); // Force re-render
        } catch (error) {
          console.error('Failed to rename sheet:', error);
        } finally {
          setIsLoading(false);
          setEditingSheet(null);
        }
      } else {
        setEditingSheet(null);
      }
    } else if (e.key === 'Escape') {
      setEditingSheet(null);
    }
  };

  if (!spreadsheet) return null;

  return (
    <div className="flex items-center border-t border-gray-300 bg-gray-50 px-2 h-8">
      <div className="flex-1 flex space-x-1 overflow-x-auto">
        {sheets.map((sheet) => (
          <div
            key={sheet.id}
            className={`
              flex items-center px-3 py-1 rounded-sm cursor-pointer
              ${sheet.id === activeSheet.id ? 'bg-white shadow' : 'hover:bg-gray-200'}
            `}
            onClick={() => handleSheetClick(sheet)}
            onDoubleClick={() => handleDoubleClick(sheet)}
          >
            {editingSheet === sheet.id ? (
              <input
                value={newSheetName}
                onChange={(e) => setNewSheetName(e.target.value)}
                onKeyDown={(e) => handleNameChange(e, sheet)}
                onBlur={() => setEditingSheet(null)}
                className="w-full outline-none bg-transparent"
                autoFocus
                disabled={isLoading}
              />
            ) : (
              <span className="text-sm">{sheet.name}</span>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={handleAddSheet}
        className={`
          p-1 rounded-sm transition-colors
          ${isLoading 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-200 active:bg-gray-300'}
        `}
        title="Add Sheet"
        disabled={isLoading}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
