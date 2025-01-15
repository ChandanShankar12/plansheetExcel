'use client';

import { createContext, useContext, useState } from 'react';
import { CellData } from '@/lib/spreadsheet/types';

interface SpreadsheetContextType {
  activeCell: string | null;
  setActiveCell: (cell: string | null) => void;
  data: Record<string, CellData>;
  setData: (data: Record<string, CellData> | ((prev: Record<string, CellData>) => Record<string, CellData>)) => void;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, CellData>>({});

  return (
    <SpreadsheetContext.Provider value={{ activeCell, setActiveCell, data, setData }}>
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