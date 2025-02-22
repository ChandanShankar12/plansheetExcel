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
  // Initialize with singleton Application instance
  const [app] = useState(() => Application.instance);
  
  // Get sheets from workbook and maintain reference
  const [sheets, setSheets] = useState<Sheet[]>(() => {
    const existingSheets = app.getWorkbook().getSheets();
    console.log('Initial sheets:', existingSheets.map(s => ({
      id: s.getId(),
      name: s.getName()
    })));
    return existingSheets;
  });
  
  // First sheet is always active initially
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(() => sheets[0]);
  
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Add new sheet to existing workbook
  const addSheet = useCallback(async (name?: string): Promise<Sheet | null> => {
    if (isTransitioning) return null;
    
    try {
      setIsTransitioning(true);
      const workbook = app.getWorkbook();
      
      const sheetName = name || `Sheet ${sheets.length + 1}`;
      const newSheet = workbook.addSheet(sheetName);
      console.log('Adding new sheet:', newSheet.getId());
      
      // Save to backend first
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: newSheet.getId(),
          name: sheetName,
          workbookId: workbook.getId()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save sheet');
      }

      // Then update local state
      setSheets(prev => {
        const updated = [...prev, newSheet];
        console.log('Updated sheets:', updated.map(s => ({
          id: s.getId(),
          name: s.getName()
        })));
        return updated;
      });

      // Switch to new sheet
      await switchSheet(newSheet);
      return newSheet;
    } catch (error) {
      console.error('Failed to add sheet:', error);
      return null;
    } finally {
      setIsTransitioning(false);
    }
  }, [app, sheets.length, isTransitioning]);

  // Switch between sheets in workbook
  const switchSheet = useCallback(async (sheet: Sheet): Promise<void> => {
    if (isTransitioning || !sheets.includes(sheet)) return;
    
    try {
      setIsTransitioning(true);
      
      // Load sheet data first
      const response = await fetch(`/api/sheets/${sheet.getId()}`);
      if (!response.ok) throw new Error('Failed to load sheet');
      
      const { data } = await response.json();
      if (data.cells) {
        Object.entries(data.cells).forEach(([cellId, cellData]) => {
          sheet.setCell(cellId, cellData as CellData);
        });
      }

      // Then update active sheet
      setActiveSheet(sheet);
    } catch (error) {
      console.error('Failed to switch sheet:', error);
    } finally {
      setIsTransitioning(false);
    }
  }, [sheets, isTransitioning]);

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection>(null);

  const updateCell = useCallback(async (id: string, data: Partial<CellData>): Promise<void> => {
    if (!activeSheet || isTransitioning) return;

    try {
      // Update cell in workbook first
      activeSheet.setCell(id, {
        value: data.value,
        isModified: true,
        lastModified: new Date().toISOString()
      });

      console.log('Updating cell in sheet:', activeSheet.getId(), 'Total sheets:', sheets.length);

      // Send to backend for caching
      const response = await fetch(`/api/sheets/${activeSheet.getId()}/cells/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: data.value,
          isModified: true,
          lastModified: new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cell update failed:', errorData);
        throw new Error('Failed to update cell');
      }

      // Update with confirmed data from backend
      const result = await response.json();
      if (result.success && activeSheet) {
        activeSheet.setCell(id, result.data);
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
      throw error;
    }
  }, [activeSheet, isTransitioning, sheets.length]);

  const value = {
    app,
    sheets,
    activeSheet,
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
