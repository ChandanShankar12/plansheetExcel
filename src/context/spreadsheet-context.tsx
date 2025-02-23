'use client';

import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Application } from '@/server/models/application';
import { Sheet } from '@/server/models/sheet';
import { Selection, CellData } from '@/lib/types';

// Create singleton instances with logging - OUTSIDE of any component
const appInstance = Application.instance;
console.log('[SpreadsheetContext] Initial app instance created');

const workbookInstance = appInstance.getWorkbook();
console.log('[SpreadsheetContext] Initial workbook retrieved');

const initialSheetsList = workbookInstance.getSheets();
console.log('[SpreadsheetContext] Initial sheets loaded:', initialSheetsList.length);

interface SpreadsheetContextType {
  // Core state
  sheets: Sheet[];
  activeSheet: Sheet | null;
  
  // UI state
  activeCell: string | null;
  selection: Selection | null;
  isTransitioning: boolean;

  // Actions
  addSheet: (name?: string) => Promise<Sheet | null>;
  switchSheet: (sheet: Sheet) => Promise<void>;
  updateCell: (id: string, data: Partial<CellData>) => Promise<void>;
  setActiveCell: (id: string | null) => void;
  setSelection: (selection: Selection | null) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | null>(null);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  // Use the pre-initialized instances
  const [sheets, setSheets] = useState(initialSheetsList);
  const [activeSheet, setActiveSheet] = useState(sheets[0] || null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Sheet operations
  const addSheet = useCallback(async (name?: string) => {
    if (isTransitioning) return null;
    console.log('[SpreadsheetContext] Adding new sheet:', name);
    setIsTransitioning(true);
    
    try {
      const newSheet = workbookInstance.addSheet(name || `Sheet ${sheets.length + 1}`);
      console.log('[SpreadsheetContext] Sheet added:', newSheet.getId());
      setSheets([...sheets, newSheet]);
      setActiveSheet(newSheet);
      return newSheet;
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to add sheet:', error);
      return null;
    } finally {
      setIsTransitioning(false);
    }
  }, [sheets, isTransitioning]);

  const switchSheet = useCallback(async (sheet: Sheet) => {
    if (isTransitioning || !sheets.includes(sheet)) return;
    setIsTransitioning(true);
    
    try {
      setActiveSheet(sheet);
    } finally {
      setIsTransitioning(false);
    }
  }, [sheets, isTransitioning]);

  const updateCell = useCallback(async (id: string, data: Partial<CellData>) => {
    if (!activeSheet || isTransitioning) return;
    
    try {
      activeSheet.setCell(id, {
        ...data,
        isModified: true,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update cell:', error);
      throw error;
    }
  }, [activeSheet, isTransitioning]);

  const value = useMemo(() => ({
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
  }), [
    sheets,
    activeSheet,
    activeCell,
    selection,
    isTransitioning,
    addSheet,
    switchSheet,
    updateCell
  ]);

  return (
    <SpreadsheetContext.Provider value={value}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
  return context;
}

