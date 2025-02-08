'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Selection } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { Spreadsheet } from '@/server/models/spreadsheet';
import { Application } from '@/server/models/application';
import { SheetController } from '@/server/controllers/sheet-controller';
import { SpreadsheetController } from '@/server/controllers/spreadsheet-controller';
import { WorkbookController } from '@/server/controllers/workbook-controller';
import { CellController } from '@/server/controllers/cell-controller';
import { db } from '@/server/db/db';
import { cells } from '@/server/db/schema';

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
  addSheet: (name: string) => void;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
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
  // Initialize Application and Spreadsheet
  const [application] = useState(() => {
    const app = new Application();
    return app;
  });

  const [spreadsheet] = useState(() => {
    const workbook = application.createWorkbook('default-user');
    return workbook.getSpreadsheet();
  });

  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selection, setSelection] = useState<Selection | null>(null);

  // Initialize first sheet
  useEffect(() => {
    if (!spreadsheet.getSheet('Sheet 1')) {
      SpreadsheetController.addSheet(spreadsheet, 'Sheet 1');
    }
  }, [spreadsheet]);

  const [activeSheet, setActiveSheet] = useState<Sheet>(() => {
    const firstSheet = spreadsheet.getSheet('Sheet 1');
    if (!firstSheet) {
      const newSheet = new Sheet('Sheet 1');
      SpreadsheetController.addSheet(spreadsheet, 'Sheet 1');
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

  const updateCell = async (cellId: string, cell: Cell) => {
    // Update in memory
    const updatedSheet = new Sheet(activeSheet.name);
    updatedSheet.id = activeSheet.id;

    activeSheet.getAllCells().forEach((existingCell, key) => {
      if (key !== cellId) {
        updatedSheet.cells.set(key, existingCell.clone());
      }
    });

    updatedSheet.cells.set(cellId, cell);
    setActiveSheet(updatedSheet);

    // Push to history
    pushToHistory({
      sheet: updatedSheet,
      activeCell,
    });

   
  };

  const undo = () => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setActiveSheet(previousState.sheet);
      setActiveCell(previousState.activeCell);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setActiveSheet(nextState.sheet);
      setActiveCell(nextState.activeCell);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const addSheet = (name: string) => {
    const newSheet = SpreadsheetController.addSheet(spreadsheet, name);
    setActiveSheet(newSheet);
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
