'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Application } from '@/server/models/application';
import { Sheet } from '@/server/models/sheet';
import { Selection, CellData } from '@/lib/types';

interface SpreadsheetContextType {
  // Core state
  app: Application;
  activeSheet: Sheet | null;
  sheets: Sheet[];
  
  // UI state
  activeCell: string | null;
  selection: Selection | null;
  isTransitioning: boolean;

  // Actions
  addSheet: (name?: string) => Promise<Sheet | null>;
  switchSheet: (sheet: Sheet) => Promise<void>;
  updateCell: (id: string, data: Partial<CellData>) => Promise<void>;
  setActiveCell: (id: string | null) => void;
  setSelection: (selection: Selection) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

// Define the hook first
export const useSpreadsheet = () => {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
  }
  return context;
};

// Then export the alias
export const useSpreadsheetContext = useSpreadsheet;

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  // Initialize core application
  const [app] = useState(() => Application.getInstance());
  
  // Initialize sheets state
  const [sheets, setSheets] = useState(() => {
    const workbook = app.getWorkbook();
    const existingSheets = workbook.getSheets();
    if (existingSheets.length === 0) {
      return [workbook.addSheet('Sheet 1')];
    }
    return existingSheets;
  });

  // UI state
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(() => sheets[0] || null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Sheet operations
  const addSheet = useCallback(async (name?: string): Promise<Sheet | null> => {
    if (isTransitioning) return null;
    
    try {
      setIsTransitioning(true);
      const workbook = app.getWorkbook();
      
      // Generate sheet name if not provided
      const sheetName = name || `Sheet ${sheets.length + 1}`;
      
      // Create sheet
      const newSheet = workbook.addSheet(sheetName);
      
      // Save to backend
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sheetName })
      });

      if (!response.ok) {
        throw new Error('Failed to create sheet');
      }

      // Update state
      // setSheets(prev => [...prev, newSheet]);
      await switchSheet(newSheet);
      
      return newSheet;
    } catch (error) {
      console.error('Failed to add sheet:', error);
      return null;
    } finally {
      setIsTransitioning(false);
    }
  }, [app, sheets.length, isTransitioning]);

  const switchSheet = useCallback(async (sheet: Sheet): Promise<void> => {
    if (isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      
      // Update active sheet
      setActiveSheet(sheet);
      
      // Save to backend
      const response = await fetch('/api/sheets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sheet.getId() })
      });

      if (!response.ok) {
        throw new Error('Failed to switch sheet');
      }
    } catch (error) {
      console.error('Failed to switch sheet:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [isTransitioning]);

  const updateCell = useCallback(async (id: string, data: Partial<CellData>): Promise<void> => {
    if (!activeSheet || isTransitioning) return;
    
    try {
      setIsTransitioning(true);
      
      // Update cell
      activeSheet.setCell(id, data);
      
      // Save to backend
      const response = await fetch(`/api/sheets/${activeSheet.getId()}/cells/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update cell');
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [activeSheet, isTransitioning]);

  const value = {
    app,
    activeSheet,
    sheets,
    activeCell,
    selection,
    isTransitioning,
    addSheet,
    switchSheet,
    updateCell,
    setActiveCell,
    setSelection
  };

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}
