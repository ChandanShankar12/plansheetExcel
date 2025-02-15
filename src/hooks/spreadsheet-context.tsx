'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Selection } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { Spreadsheet } from '@/server/models/spreadsheet';
import { Application } from '@/server/models/application';
import { SpreadsheetController } from '@/server/controllers/spreadsheet-controller';
import axios from 'axios';
import { SheetController } from '@/server/controllers/sheet-controller';


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
  // Initialize Application and Spreadsheet
  const [application] = useState(() => {
    const app = new Application();
    return app;
  });

  const [spreadsheet] = useState(() => {
    const wb = application.createWorkbook();
    return wb.getSpreadsheet();
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

  const [activeSheet, setActiveSheetState] = useState<Sheet>(() => {
    const firstSheet = spreadsheet.getSheet('Sheet 1');
    if (!firstSheet) {
      const newSheet = new Sheet('Sheet 1');
      SpreadsheetController.addSheet(spreadsheet, 'Sheet 1');
      return newSheet;
    }
    return firstSheet;
  });

  // Keep track of all sheet data
  const [sheetData, setSheetData] = useState<Map<number, Sheet>>(new Map());

  // Save sheet data when switching sheets
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
      // Update cell in active sheet
      SheetController.setCell(activeSheet, cellId, activeCell);
      console.log('Cell updated successfully:', cell);
      // Update sheet data with the active sheet
      setSheetData(prev => new Map(prev).set(activeSheet.id, activeSheet));

      // Push current state to history
      pushToHistory({
        sheet: activeSheet,
        activeCell,
      });

      // Save to Redis cache through API
      const response = await axios.post('/api/cells', {
        sheetName: activeSheet.name,
        cellId,
        value: cell.getValue(),
        formula: cell.getFormula(),
        style: cell.style
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error('Failed to save cell data');
      }

      // Log success
      console.log('Cell updated successfully:', response.data);

    } catch (error) {
      console.error('Failed to update cell:', error);
      // Optionally revert the local update if the API call fails
      setActiveSheetState(activeSheet);
      setSheetData(prev => new Map(prev).set(activeSheet.id, activeSheet));
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

  const switchActiveSheet = (sheet: Sheet) => {
    // Check if we have saved data for this sheet
    const savedSheet = sheetData.get(sheet.id);
    
    if (savedSheet) {
      // Use saved sheet data if available
      setActiveSheetState(savedSheet);
    } else {
      // Create new sheet instance if no saved data
      const newSheet = new Sheet(sheet.name);
      newSheet.id = sheet.id;
      
      // Copy cells from the original sheet
      sheet.getAllCells().forEach((cell, key) => {
        newSheet.cells.set(key, cell.clone());
      });
      
      setActiveSheetState(newSheet);
      setSheetData(prev => new Map(prev).set(newSheet.id, newSheet));
    }
    
    // Clear selection and active cell when switching sheets
    setActiveCell(null);
    setSelection(null);
  };

  const addSheet = (name: string): Sheet => {
    const newSheet = SpreadsheetController.addSheet(spreadsheet, name);
    setActiveSheetState(newSheet);
    return newSheet;
  };

  const setApplication = (app: Application) => {
    // Implementation of setApplication function
  };

  return (
    <SpreadsheetContext.Provider
      value={{
        activeCell,
        setActiveCell,
        activeSheet,
        setActiveSheet: setActiveSheetState,
        updateCell,
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
