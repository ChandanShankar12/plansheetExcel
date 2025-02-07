'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { CellData, Selection, SheetMetadata } from '@/lib/spreadsheet/types';

interface HistoryState {
  data: Record<string, CellData>;
  activeCell: string | null;
}

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  data: Record<string, CellData>;
  setData: (data: Record<string, CellData>) => void;
  updateCell: (cellId: string, updates: Partial<CellData>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  sheetId: number;
  activeSheetId: number;
  setActiveSheetId: (id: number) => void;
  sheets: SheetMetadata[];
  addSheet: (name: string) => void;
  userId: number;
  selection: Selection | null;
  setSelection: (selection: Selection | null) => void;
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
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [data, setData] = useState<Record<string | number, CellData>>({});
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sheetId] = useState<number>(1);
  const [sheets, setSheets] = useState<SheetMetadata[]>([]);
  const [activeSheetId, setActiveSheetId] = useState<number>(1);
  const [userId] = useState<number>(1);
  const [selection, setSelection] = useState<Selection | null>(null);

  const pushToHistory = (newState: HistoryState) => {
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const updateCell = (cellId: string, updates: Partial<CellData>) => {
    setData((prev) => {
      const newData = {
        ...prev,
        [cellId]: { ...prev[cellId], ...updates },
      };

      // Push to history
      pushToHistory({
        data: newData,
        activeCell,
      });

      return newData;
    });
  };

  const undo = () => {
    if (currentIndex > 0) {
      const previousState = history[currentIndex - 1];
      setData(previousState.data);
      setActiveCell(previousState.activeCell);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextState = history[currentIndex + 1];
      setData(nextState.data);
      setActiveCell(nextState.activeCell);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const addSheet = (name: string) => {
    const newSheet: SheetMetadata = {
      id: Date.now(),
      name,
      userId: userId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetId(newSheet.id);
  };
  console.log(
    activeCell,
    setActiveCell,
    data,
    setData,
    updateCell,
    undo,
    redo,
    // canUndo,
    // canRedo,
    sheetId,
    activeSheetId,
    setActiveSheetId,
    sheets,
    addSheet,
    userId,
    selection,
    setSelection
  );

  // useEffect(() => {
  //   const loadWorkbookData = async () => {
  //     try {
  //       const response = await fetch(`/api/cells?sheetId=${activeSheetId}&userId=${userId}`);
  //       if (!response.ok) throw new Error('Failed to load workbook');

  //       const cells = await response.json();
  //       const newData: Record<string, CellData> = {};

  //       cells.forEach((cell: Sheet) => {
  //         const colLetter = String.fromCharCode(64 + cell.columnIndex);
  //         const cellId = `${activeSheetId}_${colLetter}${cell.rowIndex}`;
  //         newData[cellId] = {
  //           value: cell.value || '',
  //           style: cell.metadata?.style || {},
  //           formula: cell.metadata?.formula
  //         };
  //       });

  //       setData(newData);
  //     } catch (error) {
  //       console.error('Error loading workbook:', error);
  //     }
  //   };

  //   loadWorkbookData();
  // }, [activeSheetId, userId]);

  return (
    <SpreadsheetContext.Provider
      value={{
        activeCell,
        setActiveCell,
        data,
        setData,
        updateCell,
        undo,
        redo,
        canUndo: currentIndex > 0,
        canRedo: currentIndex < history.length - 1,
        sheetId,
        activeSheetId,
        setActiveSheetId,
        sheets,
        addSheet,
        userId,
        selection,
        setSelection,
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
