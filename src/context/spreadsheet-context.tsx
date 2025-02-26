'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Sheet } from '@/server/models/sheet';
import { Cell } from '@/server/models/cell';
import { Selection, CellData } from '@/lib/types';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';

// Define the context type
interface SpreadsheetContextType {
  sheets: Sheet[];
  activeSheet: Sheet | null;
  activeCell: string | null;
  selection: Selection | null;
  isTransitioning: boolean;
  setActiveSheet: (sheet: Sheet | null) => void;
  setActiveCell: (cellId: string | null) => void;
  setSelection: (selection: Selection | null) => void;
  addSheet: (name?: string) => Promise<void>;
  updateCell: (cellId: string, data: Partial<CellData>) => Promise<void>;
  switchSheet: (sheet: Sheet) => void;
  saveWorkbook: () => Promise<boolean>;
}

const SpreadsheetContext = createContext<SpreadsheetContextType | undefined>(undefined);

export function SpreadsheetProvider({ children }: { children: React.ReactNode }) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [activeSheet, setActiveSheet] = useState<Sheet | null>(null);
  const [activeCell, setActiveCell] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load sheets from API or create default
  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        // Try to fetch sheets from API
        const resp = await fetch('/api/init');
        const data = await resp.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to initialize application');
        }

        // Parse sheets from response
        const loadedSheets = data.data?.sheets?.map((sheetData: any) => 
          Sheet.fromJSON(sheetData)
        ) || [];
        
        if (loadedSheets.length > 0) {
          setSheets(loadedSheets);
          setActiveSheet(loadedSheets[0]);
        } else {
          // Create default sheet if none returned
          throw new Error('No sheets returned from server');
        }
      } catch (error) {
        console.error('[SpreadsheetContext] Failed to load sheets:', error);
        
        // Create a default sheet if loading fails
        const defaultSheet = new Sheet('Sheet 1', 1);
        setSheets([defaultSheet]);
        setActiveSheet(defaultSheet);
        
        toast({
          title: 'Using default sheet',
          description: 'Could not load sheets from server',
          variant: 'default',
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [toast]);

  // Debounced save function for cell updates
  const debouncedSave = useDebounce(async (sheetId: number, cellId: string, data: CellData) => {
    try {
      const response = await fetch(`/api/sheets/${sheetId}/cells/${cellId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save cell');
      }
      
      console.log(`[SpreadsheetContext] Cell ${cellId} saved successfully`);
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to save cell:', error);
      toast({
        title: 'Error',
        description: 'Failed to save cell changes',
        variant: 'destructive',
      });
    }
  }, 500);

  // Add a new sheet
  const addSheet = useCallback(async (name?: string) => {
    try {
      const sheetName = name || `Sheet ${sheets.length + 1}`;
      
      // Create sheet on server
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sheetName })
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create sheet');
      }
      
      // Create local sheet from response
      const newSheet = Sheet.fromJSON(data.data);
      
      setSheets(prev => [...prev, newSheet]);
      setActiveSheet(newSheet);
      
      console.log(`[SpreadsheetContext] Sheet "${sheetName}" created successfully with ID ${newSheet.getId()}`);
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to add sheet:', error);
      
      // Fallback: create sheet locally if API fails
      const newSheet = new Sheet(name || `Sheet ${sheets.length + 1}`, Date.now());
      setSheets(prev => [...prev, newSheet]);
      setActiveSheet(newSheet);
      
      toast({
        title: 'Warning',
        description: 'Sheet created locally only - changes may not persist',
        variant: 'default',
      });
    }
  }, [sheets, toast]);

  // Switch to a different sheet
  const switchSheet = useCallback((sheet: Sheet) => {
    if (sheets.some(s => s.getId() === sheet.getId())) {
      setActiveSheet(sheet);
      setActiveCell(null);
      setSelection(null);
    }
  }, [sheets]);

  // Save workbook state
  const saveWorkbook = useCallback(async () => {
    try {
      const response = await fetch('/api/workbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save workbook');
      }
      
      console.log('[SpreadsheetContext] Workbook saved successfully');
      return true;
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to save workbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workbook state',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Update a cell
  const updateCell = useCallback(async (cellId: string, data: Partial<CellData>) => {
    if (!activeSheet) return;
    
    try {
      // Get current cell data or create default
      const currentCell = activeSheet.getCell(cellId) || {
        value: '',
        formula: '',
        style: {},
        isModified: false,
        lastModified: new Date().toISOString()
      };
      
      // Create updated cell data
      const updatedCellData: CellData = {
        ...currentCell,
        ...data,
        isModified: true,
        lastModified: new Date().toISOString()
      };
      
      // Update cell in the active sheet
      const cell = activeSheet.getCell(cellId) || new Cell(activeSheet.getId(), 1, 'A');
      cell.updateProperties(updatedCellData);
      activeSheet.setCell(cellId, cell);
      
      // Force re-render by creating a new array
      setSheets(prev => [...prev]);
      
      // Save to server in the background
      debouncedSave(activeSheet.getId(), cellId, updatedCellData);
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to update cell:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cell',
        variant: 'destructive',
      });
    }
  }, [activeSheet, debouncedSave, toast]);

  return (
    <SpreadsheetContext.Provider
      value={{
        sheets,
        activeSheet,
        activeCell,
        selection,
        isTransitioning: isLoading,
        setActiveSheet,
        setActiveCell,
        setSelection,
        addSheet,
        updateCell,
        switchSheet,
        saveWorkbook,
      }}
    >
      {children}
    </SpreadsheetContext.Provider>
  );
}

export function useSpreadsheet() {
  const context = useContext(SpreadsheetContext);
  if (!context) {
    throw new Error('useSpreadsheet must be used within SpreadsheetProvider');
  }
  return context;
}
