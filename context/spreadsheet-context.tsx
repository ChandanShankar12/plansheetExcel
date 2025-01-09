'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { CellData, CellStyle, SpreadsheetHistory } from '../lib/spreadsheet/types';

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  data: Record<string, CellData>;
  updateCell: (cellId: string, updates: Partial<CellData>) => void;
  clipboard: { type: 'cut' | 'copy' | null; data: Record<string, CellData> };
  cutCells: () => void;
  copyCells: () => void;
  pasteCells: () => void;
  undo: () => void;
  redo: () => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, CellData>>({});
  const [clipboard, setClipboard] = useState<{ type: 'cut' | 'copy' | null; data: Record<string, CellData> }>({
    type: null,
    data: {},
  });
  const [history, setHistory] = useState<SpreadsheetHistory>({ past: [], future: [] });

  const updateCell = useCallback((cellId: string, updates: Partial<CellData>) => {
    setHistory(prev => ({
      past: [...prev.past, data],
      future: [],
    }));

    setData(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        ...updates,
        style: {
          ...(prev[cellId]?.style || {}),
          ...(updates.style || {}),
        },
      },
    }));
  }, [data]);

  const cutCells = useCallback(() => {
    if (!activeCell) return;
    setClipboard({ type: 'cut', data: { [activeCell]: data[activeCell] } });
  }, [activeCell, data]);

  const copyCells = useCallback(() => {
    if (!activeCell) return;
    setClipboard({ type: 'copy', data: { [activeCell]: data[activeCell] } });
  }, [activeCell, data]);

  const pasteCells = useCallback(() => {
    if (!activeCell || !clipboard.data) return;
    
    const [[, cellData]] = Object.entries(clipboard.data);
    updateCell(activeCell, cellData);

    if (clipboard.type === 'cut') {
      setClipboard({ type: null, data: {} });
    }
  }, [activeCell, clipboard, updateCell]);

  const undo = useCallback(() => {
    if (history.past.length === 0) return;
    
    const newPast = [...history.past];
    const lastState = newPast.pop()!;
    
    setHistory({
      past: newPast,
      future: [data, ...history.future],
    });
    
    setData(lastState);
  }, [data, history]);

  const redo = useCallback(() => {
    if (history.future.length === 0) return;
    
    const newFuture = [...history.future];
    const nextState = newFuture.shift()!;
    
    setHistory({
      past: [...history.past, data],
      future: newFuture,
    });
    
    setData(nextState);
  }, [data, history]);

  return (
    <SpreadsheetContext.Provider value={{
      activeCell,
      setActiveCell,
      data,
      updateCell,
      clipboard,
      cutCells,
      copyCells,
      pasteCells,
      undo,
      redo,
    }}>
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheetContext() {
  const context = useContext(SpreadsheetContext);
  if (context === undefined) {
    throw new Error('useSpreadsheetContext must be used within a SpreadsheetProvider');
  }
  return context;
}