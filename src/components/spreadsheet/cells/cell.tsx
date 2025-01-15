'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';

interface CellProps {
  cellId: string;
  isActive: boolean;
}

export function Cell({ cellId, isActive }: CellProps) {
  const { setActiveCell, data, updateCell } = useSpreadsheetContext();
  const cellData = data[cellId] || { value: '', style: {} };
  const displayValue = cellData.value?.startsWith('=') 
    ? evaluateFormula(cellData.value, data) 
    : cellData.value;

  const style = cellData.style || {};
  
  return (
    <td
      className={cn(
        'border min-w-[100px] h-8 px-2 relative',
        isActive && 'bg-primary/10'
      )}
      onClick={() => setActiveCell(cellId)}
      style={{
        fontFamily: style.fontFamily,
        fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
        fontWeight: style.bold ? 'bold' : undefined,
        fontStyle: style.italic ? 'italic' : undefined,
        textDecoration: style.underline ? 'underline' : undefined,
        textAlign: style.align || 'left',
      }}
    >
      {isActive ? (
        <Input
          value={cellData.value}
          onChange={(e) => updateCell(cellId, { value: e.target.value })}
          onBlur={() => setActiveCell(null)}
          className="absolute inset-0 border-2 border-primary"
          autoFocus
        />
      ) : (
        <span className="truncate block">{displayValue}</span>
      )}
    </td>
  );
}