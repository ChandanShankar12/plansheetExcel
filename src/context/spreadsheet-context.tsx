'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Selection } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { Spreadsheet } from '@/server/models/spreadsheet';
import { Application } from '@/server/models/application';
import { ApplicationController } from '@/server/controllers/application.controller';
import { SpreadsheetController } from '@/server/controllers/spreadsheet.controller';
import { SheetController } from '@/server/controllers/sheet.controller';
import { CellController } from '@/server/controllers/cell.controller';
import axios from 'axios';
import { CellData } from '@/lib/types';

interface HistoryState {
  sheet: Sheet;
  activeCell: string | null;
}

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  activeSheet: Sheet;
  setActiveSheet: (sheet: Sheet) => void;
  updateCell: (cellId: string, value: any, formula?: string) => Promise<CellData | null>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  spreadsheet: Spreadsheet;
  addSheet: (name: string) => void;
  selection: { start: string; end: string } | null;
  setSelection: (selection: { start: string; end: string } | null) => void;
  application: Application;
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
  // Initialize from singleton Application
  const [application] = useState(() => Application.getInstance());
  const [workbook] = useState(() => {
    const activeWorkbook = application.getActiveWorkbook();
    if (!activeWorkbook) throw new Error('No active workbook');
    return activeWorkbook;
  });

  const [spreadsheet] = useState(() => workbook.getSpreadsheet());

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(null);

  // Initialize first sheet
  const [activeSheet, setActiveSheetState] = useState<Sheet>(() => {
    const firstSheet = spreadsheet.getActiveSheet();
    if (!firstSheet) {
      const newSheet = SpreadsheetController.addSheet(spreadsheet.getWorkbookId(), 'Sheet 1');
      if (!newSheet) throw new Error('Failed to create initial sheet');
      return newSheet;
    }
    return firstSheet;
  });

  const pushToHistory = (newState: HistoryState) => {
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const updateCell = async (cellId: string, value: any, formula?: string) => {
    if (!activeSheet) return null;

    try {
      const response = await axios.post('/api/cells', {
        sheetId: activeSheet.id,
        cellId,
        value,
        formula
      });

      if (response.data.success) {
        const cell = activeSheet.getCell(cellId);
        if (cell) {
          cell.setValue(value);
          if (formula) cell.setFormula(formula);
        }
        return response.data.data;
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
    return null;
  };

  const loadCell = async (cellId: string) => {
    if (!activeSheet) return null;

    try {
      const response = await axios.get('/api/cells/get', {
        params: {
          sheetId: activeSheet.id,
          cellId,
        }
      });

      if (response.data.success && response.data.data) {
        const cellData = response.data.data;
        const cell = activeSheet.getCell(cellId);
        if (cell) {
          cell.setValue(cellData.value);
          cell.setFormula(cellData.formula);
          cell.style = cellData.style;
        }
        return cellData;
      }
      return null;
    } catch (error) {
      console.error('Failed to load cell:', error);
      return null;
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

  const addSheet = (name: string) => {
    const newSheet = SpreadsheetController.addSheet(spreadsheet.getWorkbookId(), name);
    if (newSheet) {
      setActiveSheetState(newSheet);
    }
  };

  const setActiveSheet = (sheet: Sheet) => {
    SpreadsheetController.setActiveSheet(spreadsheet.getWorkbookId(), sheet.id);
    setActiveSheetState(sheet);
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
        addSheet,
        selection,
        setSelection,
        application,
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
