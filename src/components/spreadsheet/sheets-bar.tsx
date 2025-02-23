'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { Sheet } from '@/server/models/sheet';
import { useState, useCallback, memo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

const SheetButton = memo(function SheetButton({ 
  sheet, 
  isActive, 
  onClick
}: { 
  sheet: Sheet; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <div
      className={`
        relative flex items-center h-[32px] px-4 
        cursor-pointer select-none
        ${isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'}
      `}
      onClick={onClick}
    >
      <span className="text-[13px]">
        {sheet.getName()}
      </span>
      
      {/* Active indicator line */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#107c41]" />
      )}
    </div>
  );
});

export const SheetsBar = memo(function SheetsBar() {
  const { sheets, activeSheet, addSheet, switchSheet } = useSpreadsheet();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddSheet = useCallback(async () => {
    if (isAdding) return;
    
    try {
      setIsAdding(true);
      const sheetNumber = sheets.length + 1;
      console.log('[SheetsBar] Adding new sheet:', sheetNumber);
      const newSheet = await addSheet(`Sheet ${sheetNumber}`);
      if (newSheet) {
        console.log('[SheetsBar] Sheet added successfully:', newSheet.getId());
        toast({
          title: 'Success',
          description: 'New sheet added',
        });
      }
    } catch (error) {
      console.error('[SheetsBar] Failed to add sheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sheet',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  }, [isAdding, addSheet, toast, sheets.length]);

  const handleSheetClick = useCallback(async (sheet: Sheet) => {
    if (sheet.getId() === activeSheet?.getId()) return;
    await switchSheet(sheet);
  }, [activeSheet, switchSheet]);

  return (
    <div className="flex items-center h-[32px] bg-white border-t border-[#e1e3e6]">
      <div className="flex">
        {sheets.map((sheet) => (
          <SheetButton
            key={sheet.getId()}
            sheet={sheet}
            isActive={activeSheet?.getId() === sheet.getId()}
            onClick={() => handleSheetClick(sheet)}
          />
        ))}
      </div>

      {/* Add sheet button */}
      <button
        onClick={handleAddSheet}
        disabled={isAdding}
        className={`
          flex items-center justify-center
          w-[32px] h-[32px]
          hover:bg-gray-100
          ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Plus className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
});
