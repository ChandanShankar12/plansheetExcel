'use client';

import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import { getAppInstance } from '@/lib/app-instance';
import { Sheet } from '@/server/models/sheet';
import { Selection, CellData } from '@/lib/types';
import { WorkbookController } from '@/server/controllers/workbook.controller';

const app = getAppInstance();
const workbook = app.getWorkbook();
const initialSheets = workbook.getSheets();

interface SpreadsheetContextType {
  sheets: Sheet[];
  activeSheet: Sheet | null;
  activeCell: string | null;
  selection: Selection | null;
  addSheet: (name: string) => Promise<void>;
  switchSheet: (sheet: Sheet) => void;
  updateCell: (id: string, data: Partial<CellData>) => void;
  setActiveCell: (id: string | null) => void;
  setSelection: (selection: Selection | null) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | null>(null);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [sheets, setSheets] = useState(initialSheets);
  const [activeSheet, setActiveSheet] = useState(sheets[0] || null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const isAddingRef = useRef(false);

  const addSheet = useCallback(async (name: string) => {
    if (isAddingRef.current) return;
    
    try {
      isAddingRef.current = true;
      const newSheet = await WorkbookController.instance.addSheet(name);
      setSheets(prev => [...prev, newSheet]);
      setActiveSheet(newSheet);
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to add sheet:', error);
    } finally {
      setTimeout(() => {
        isAddingRef.current = false;
      }, 100);
    }
  }, []);

  const switchSheet = useCallback((sheet: Sheet) => {
    if (sheets.includes(sheet)) {
      setActiveSheet(sheet);
    }
  }, [sheets]);

  const updateCell = useCallback((id: string, data: Partial<CellData>) => {
    if (!activeSheet) return;
    activeSheet.setCell(id, {
      ...data,
      isModified: true,
      lastModified: new Date().toISOString()
    });
  }, [activeSheet]);

  const value = useMemo(() => ({
    sheets,
    activeSheet,
    activeCell,
    selection,
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
