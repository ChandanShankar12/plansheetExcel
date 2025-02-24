'use client';

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { initializeApp, getAppInstance } from '@/lib/app-instance';
import { Sheet } from '@/server/models/sheet';
import { Selection, CellData } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';

// Initialize app and get workbook
const initializeSheets = async () => {
  const app = await initializeApp();
  return app.getWorkbook().getSheets();
};

interface SpreadsheetContextType {
  sheets: Sheet[];
  activeSheet: Sheet | null;
  activeCell: string | null;
  selection: Selection | null;
  isLoading: boolean;
  addSheet: (name?: string) => Promise<void>;
  switchSheet: (sheet: Sheet) => void;
  updateCell: (id: string, data: Partial<CellData>) => void;
  setActiveCell: (id: string | null) => void;
  setSelection: (selection: Selection | null) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | null>(null);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pendingUpdates = useRef(new Map<string, CellData>());

  // Load initial data
  useEffect(() => {
    initializeSheets()
      .then(initialSheets => {
        setSheets(initialSheets);
        setActiveSheet(initialSheets[0] || null);
      })
      .catch(error => {
        console.error('[SpreadsheetContext] Failed to initialize:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Debounced save function
  const debouncedSave = useDebounce(async () => {
    if (pendingUpdates.current.size === 0) return;

    try {
      const app = getAppInstance();
      await app.saveState();
      pendingUpdates.current.clear();
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to save updates:', error);
    }
  }, 500);

  const addSheet = useCallback(async (name?: string) => {
    try {
      const workbook = getAppInstance().getWorkbook();
      const newSheet = workbook.addSheet(name);
      setSheets(workbook.getSheets());
      setActiveSheet(newSheet);
      
      // Save state after modification
      await getAppInstance().saveState();
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to add sheet:', error);
    }
  }, []);

  const switchSheet = useCallback((sheet: Sheet) => {
    if (sheets.includes(sheet)) {
      setActiveSheet(sheet);
    }
  }, [sheets]);

  const updateCell = useCallback((id: string, data: Partial<CellData>) => {
    if (!activeSheet) return;

    // Optimistically update local state
    const updatedData: CellData = {
      ...activeSheet.getCell(id),
      ...data,
      isModified: true,
      lastModified: new Date().toISOString()
    };

    // Update local state immediately
    activeSheet.setCell(id, updatedData);
    setSheets(prev => [...prev]); // Trigger re-render

    // Track pending update
    pendingUpdates.current.set(id, updatedData);

    // Trigger debounced save
    debouncedSave();
  }, [activeSheet, debouncedSave]);

  const value = useMemo(() => ({
    sheets,
    activeSheet,
    activeCell,
    selection,
    isLoading,
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
    isLoading,
    addSheet,
    switchSheet,
    updateCell
  ]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
