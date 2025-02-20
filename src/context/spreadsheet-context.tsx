'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Selection, CellData } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheets';
import { Spreadsheet } from '@/server/models/spreadsheet';
import { Application } from '@/server/models/application';
import { ApplicationController } from '@/server/controllers/application.controller';
import { SpreadsheetController } from '@/server/controllers/spreadsheet.controller';
import axios from 'axios';
import { Workbook } from '@/server/models/workbook';

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  activeSheet: Sheet;
  setActiveSheet: (sheet: Sheet) => void;
  updateCell: (cellId: string, value: any, formula?: string) => Promise<CellData | null>;
  spreadsheet: Spreadsheet;
  addSheet: (name?: string) => Promise<Sheet | null>;
  selection: { start: string; end: string } | null;
  setSelection: (selection: { start: string; end: string } | null) => void;
  application: Application;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  // Initialize from singleton Workbook
  const [workbook] = useState(() => Workbook.getInstance());
  const [spreadsheet] = useState(() => workbook.getSpreadsheet());
  
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: string; end: string } | null>(null);

  // Initialize first sheet
  const [activeSheet, setActiveSheetState] = useState<Sheet>(() => {
    const firstSheet = spreadsheet.getActiveSheet();
    if (!firstSheet) {
      // Create initial sheet if none exists
      const newSheet = SpreadsheetController.addSheet('Sheet 1');
      if (!newSheet) {
        throw new Error('Failed to create initial sheet');
      }
      return newSheet;
    }
    return firstSheet;
  });

  const getNextSheetName = () => {
    const sheets = spreadsheet.getAllSheets();
    const sheetNumbers = sheets.map(sheet => {
      const match = sheet.name.match(/Sheet (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNumber = Math.max(0, ...sheetNumbers);
    return `Sheet ${maxNumber + 1}`;
  };

  const addSheet = async (name?: string): Promise<Sheet | null> => {
    try {
      const sheetName = name || getNextSheetName();
      const newSheet = SpreadsheetController.addSheet(sheetName);
      if (!newSheet) {
        throw new Error('Failed to create sheet');
      }

      // Update local state and switch to new sheet
      setActiveSheetState(newSheet);
      setSelection(null);
      setActiveCell(null);

      return newSheet;
    } catch (error) {
      console.error('Failed to add sheet:', error);
      return null;
    }
  };

  const setActiveSheet = async (sheet: Sheet) => {
    try {
      // Update active sheet in spreadsheet
      SpreadsheetController.setActiveSheet(sheet.id);
      setActiveSheetState(sheet);
      setSelection(null);
      setActiveCell(null);
    } catch (error) {
      console.error('Failed to switch sheet:', error);
    }
  };

  const updateCell = async (cellId: string, value: any, formula?: string): Promise<CellData | null> => {
    if (!activeSheet) return null;

    try {
      const cell = activeSheet.getCell(cellId);
      cell.setValue(value);
      if (formula) cell.setFormula(formula);
      activeSheet.markCellAsModified(cellId);

      // Save immediately for better UX
      const modifiedCells = activeSheet.getModifiedCells();
      const response = await axios.post('/api/sheets', {
        sheetId: activeSheet.id,
        cells: modifiedCells
      });

      if (response.data.success) {
        activeSheet.clearModifiedCells();
        return response.data.data?.cells[cellId] || null;
      }
    } catch (error) {
      console.error('Failed to update cell:', error);
    }
    return null;
  };

  // Auto-save modified cells periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (activeSheet) {
        const modifiedCells = activeSheet.getModifiedCells();
        if (Object.keys(modifiedCells).length > 0) {
          try {
            await axios.post('/api/sheets', {
              sheetId: activeSheet.id,
              cells: modifiedCells
            });
            activeSheet.clearModifiedCells();
          } catch (error) {
            console.error('Failed to auto-save cells:', error);
          }
        }
      }
    }, 5000); // Save every 5 seconds if there are modifications

    return () => clearInterval(saveInterval);
  }, [activeSheet]);

  return (
    <SpreadsheetContext.Provider
      value={{
        activeCell,
        setActiveCell,
        activeSheet,
        setActiveSheet,
        updateCell,
        spreadsheet,
        addSheet,
        selection,
        setSelection,
        application: Application.getInstance(),
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheetContext() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheetContext must be used within SpreadsheetProvider');
  }
  return context;
}
