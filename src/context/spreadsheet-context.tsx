'use client';

import { createContext, useContext, useState } from 'react';
import { CellData } from '@/lib/spreadsheet/types';

interface HistoryState {
  data: Record<string, CellData>;
  activeCell: string | null;
}

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  data: Record<string, CellData>;
  setData: (data: Record<string, CellData> | ((prev: Record<string, CellData>) => Record<string, CellData>)) => void;
  updateCell: (cellId: string, updates: Partial<CellData>) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

const MAX_HISTORY = 50;

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, CellData>>({});
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const pushToHistory = (newState: HistoryState) => {
    const newHistory = [...history.slice(0, currentIndex + 1), newState];
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const updateCell = (cellId: string, updates: Partial<CellData>) => {
    setData(prev => {
      const newData = {
        ...prev,
        [cellId]: { ...prev[cellId], ...updates }
      };
      
      // Push to history
      pushToHistory({
        data: newData,
        activeCell
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

  return (
    <SpreadsheetContext.Provider value={{ 
      activeCell, 
      setActiveCell, 
      data, 
      setData,
      updateCell,
      undo,
      redo,
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1
    }}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheetContext() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheetContext must be used within a SpreadsheetProvider');
  }
  return context;
}