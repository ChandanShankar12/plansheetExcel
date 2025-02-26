'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Sheet } from '@/server/models/sheet';
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
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
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
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const { toast } = useToast();

  // Load sheets from API or create default
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    
    (async () => {
      try {
        // Try to fetch sheets from API
        const resp = await fetch('/api/init');
        const data = await resp.json();

        if (!isMounted) return;

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
          
          // Log successful initialization
          console.log('[SpreadsheetContext] Loaded sheets from server:', loadedSheets.length);
        } else {
          // Create default sheet if none returned
          throw new Error('No sheets returned from server');
        }
      } catch (error) {
        if (!isMounted) return;
        
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
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Debounced save function for cell updates
  const debouncedSave = useDebounce(async (sheetId: number, cellId: string, data: CellData) => {
    try {
      await fetch(`/api/sheets/${sheetId}/cells/${cellId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
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
      activeSheet.setCell(cellId, updatedCellData);
      
      // Force re-render by creating a new array
      setSheets(prev => [...prev]);
      
      // Always update the cell in the cache via API call
      try {
        await fetch(`/api/sheets/${activeSheet.getId()}/cells/${cellId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedCellData)
        });
        console.log(`[SpreadsheetContext] Cell ${cellId} updated and cached`);
      } catch (error) {
        console.error('[SpreadsheetContext] Failed to update cell in cache:', error);
      }
      
      // If autoSave is enabled, we don't need to do anything else as the cell is already saved
      // The debouncedSave is no longer needed as we're always saving immediately
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to update cell:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cell',
        variant: 'destructive',
      });
    }
  }, [activeSheet, toast]);

  // Save workbook to server and cache
  const saveWorkbook = useCallback(async (): Promise<boolean> => {
    try {
      if (isLoading) {
        console.log('[SpreadsheetContext] Cannot save workbook while loading');
        return false;
      }
      
      if (sheets.length === 0) {
        console.warn('[SpreadsheetContext] No sheets to save');
        return false;
      }

      // Call the API to save the workbook
      const response = await fetch('/api/workbook/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to save workbook');
      }
      
      console.log('[SpreadsheetContext] Workbook saved successfully');
      return true;
    } catch (error) {
      console.error('[SpreadsheetContext] Failed to save workbook:', error);
      toast({
        title: 'Error',
        description: 'Failed to save workbook',
        variant: 'destructive',
      });
      return false;
    }
  }, [sheets, toast, isLoading]);

  return (
    <SpreadsheetContext.Provider
      value={{
        sheets,
        activeSheet,
        activeCell,
        selection,
        isTransitioning: isLoading,
        autoSaveEnabled,
        setAutoSaveEnabled,
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
