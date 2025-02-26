'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useCallback, useState } from 'react';
import { Plus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * SheetsBar component displays a bar of sheet tabs and an add sheet button
 */
export function SheetsBar() {
  const { sheets, activeSheet, addSheet, switchSheet, saveWorkbook } = useSpreadsheet();
  const [isAddingSheet, setIsAddingSheet] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddSheet = useCallback(async () => {
    if (isAddingSheet) return;
    
    try {
      setIsAddingSheet(true);
      const nextNumber = sheets.length + 1;
      await addSheet(`Sheet ${nextNumber}`);
      
      toast({
        title: 'Sheet added',
        description: `Sheet ${nextNumber} has been created`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to add sheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to add new sheet',
        variant: 'destructive',
      });
    } finally {
      setIsAddingSheet(false);
    }
  }, [addSheet, sheets.length, isAddingSheet, toast]);

  const handleSaveWorkbook = useCallback(async () => {
    if (isSaving) return;
    
    try {
      setIsSaving(true);
      const success = await saveWorkbook();
      
      if (success) {
        toast({
          title: 'Workbook saved',
          description: 'All changes have been saved',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to save workbook:', error);
    } finally {
      setIsSaving(false);
    }
  }, [saveWorkbook, isSaving, toast]);

  return (
    <div className="flex items-center h-[24px] bg-[#f8f9fa] border-t border-[#e1e3e6]">
      <div className="flex flex-1">
        {sheets.map((sheet) => (
          <div
            key={sheet.getId()}
            className={`
              relative flex items-center h-[24px] px-3
              cursor-pointer select-none border-r border-[#e1e3e6]
              ${activeSheet?.getId() === sheet.getId() 
                ? 'bg-white' 
                : 'bg-[#f8f9fa] hover:bg-gray-100'
              }
            `}
            onClick={() => switchSheet(sheet)}
          >
            <span className="text-[12px] text-gray-700">{sheet.getName()}</span>
            {activeSheet?.getId() === sheet.getId() && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#107c41]" />
            )}
          </div>
        ))}
      </div>

      <div className="flex">
        <button
          onClick={handleAddSheet}
          disabled={isAddingSheet}
          className="w-[24px] h-[24px] flex items-center justify-center border-l border-[#e1e3e6] hover:bg-gray-100 disabled:opacity-50"
          aria-label="Add new sheet"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
        
        <button
          onClick={handleSaveWorkbook}
          disabled={isSaving}
          className="w-[24px] h-[24px] flex items-center justify-center border-l border-[#e1e3e6] hover:bg-gray-100 disabled:opacity-50"
          aria-label="Save workbook"
        >
          <Save className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
