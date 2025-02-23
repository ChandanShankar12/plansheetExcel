'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useState, useCallback, useEffect, memo } from 'react';
import { useToast } from '@/hooks/use-toast';

export const FormulaBar = memo(function FormulaBar() {
  const { activeSheet, activeCell, updateCell } = useSpreadsheet();
  const [formula, setFormula] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!activeSheet || !activeCell) {
      setFormula('');
      return;
    }
    const cell = activeSheet.getCell(activeCell);
    setFormula(cell.formula || cell.value || '');
  }, [activeSheet, activeCell]);

  const handleFormulaChange = useCallback(async (value: string) => {
    if (!activeSheet || !activeCell) return;

    try {
      await updateCell(activeCell, {
        formula: value.startsWith('=') ? value : '',
        value: value.startsWith('=') ? '' : value
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update formula',
        variant: 'destructive',
      });
    }
  }, [activeSheet, activeCell, updateCell, toast]);

  return (
    <div className="flex items-center h-[24px] px-2 border-b border-[#e1e3e6] bg-white">
      <input
        value={formula}
        onChange={(e) => setFormula(e.target.value)}
        onBlur={() => handleFormulaChange(formula)}
        placeholder="Enter formula or value"
        className="w-full h-full outline-none text-[13px]"
        disabled={!activeCell}
      />
    </div>
  );
}); 