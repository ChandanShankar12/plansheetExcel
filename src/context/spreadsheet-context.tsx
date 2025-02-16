'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Selection } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { Spreadsheet } from '@/server/models/spreadsheet';
import { Application } from '@/server/models/application';
import { SpreadsheetController } from '@/server/controllers/spreadsheet-controller';
import { CellController } from '@/server/controllers/cell-controller';
import axios from 'axios';

interface HistoryState {
  sheet: Sheet;
  activeCell: string | null;
}

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  activeSheet: Sheet;
  setActiveSheet: (sheet: Sheet) => void;
  updateCell: (cellId: string, cell: Cell) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  spreadsheet: Spreadsheet;
  sheets: Sheet[];
  addSheet: (name: string) => Sheet;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
  application: Application;
  setApplication: (app: Application) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(
  undefined
);

const MAX_HISTORY = 50;

export function SpreadsheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Application and get active workbook's spreadsheet
  const [application] = useState(() => new Application());
  const [spreadsheet] = useState(() => {
    const workbook = application.getActiveWorkbook();
    if (!workbook) throw new Error('No active workbook');
    return workbook.getSpreadsheet();
  });

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Initialize first sheet if needed
  const [activeSheet, setActiveSheetState] = useState<Sheet>(() => {
    const firstSheet = spreadsheet.getSheet('Sheet 1');
    if (!firstSheet) {
      const newSheet = SpreadsheetController.addSheet(spreadsheet, 'Sheet 1');
      return newSheet;
    }
    return firstSheet;
  });

  // Track sheet data
  const [sheetData, setSheetData] = useState<Map<number, Sheet>>(new Map());

  // Update sheet data when active sheet changes
  useEffect(() => {
    if (activeSheet) {
      setSheetData(prev => new Map(prev).set(activeSheet.id, activeSheet));
    }
  }, [activeSheet]);

  const pushToHistory = (newState: HistoryState) => {
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const updateCell = async (cellId: string, cell: Cell) => {
    try {
      // Only save if cell is dirty (has been modified)
      if (cell.isDirtyCell()) {
        const value = cell.getValue();
        
        // Only save non-empty values
        if (value !== null && value !== '') {
          const response = await axios.post('/api/cells', {
            sheetName: activeSheet.name,
            cellId,
            value: value,
            formula: cell.getFormula(),
            style: cell.style
          });

          if (!response.data.success) {
            throw new Error('Failed to save cell data');
          }
          
          cell.clearDirtyFlag(); // Clear dirty flag after successful save
        }
      }

      pushToHistory({
        sheet: activeSheet,
        activeCell,
      });

    } catch (error) {
      console.error('Failed to update cell:', error);
      throw error;
    }
  };

  const undo = () => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setActiveSheetState(previousState.sheet);
      setActiveCell(previousState.activeCell);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setActiveSheetState(nextState.sheet);
      setActiveCell(nextState.activeCell);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const addSheet = (name: string): Sheet => {
    const newSheet = new Sheet(name);
    spreadsheet.addSheet(newSheet);
    setActiveSheetState(newSheet);
    return newSheet;
  };

  const setActiveSheet = (sheet: Sheet) => {
    setActiveSheetState(sheet);
  };

  const setApplication = (app: Application) => {
    // Implementation when needed for file loading
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        activeCell,
        setActiveCell,
        activeSheet,
        setActiveSheet,
        updateCell,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        spreadsheet,
        sheets: spreadsheet.sheets,
        addSheet,
        selection,
        setSelection,
        application,
        setApplication,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheetContext() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error(
      'useSpreadsheetContext must be used within a SpreadsheetProvider'
    );
  }
  return context;
}
