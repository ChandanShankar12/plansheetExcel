'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';

/**
 * Props for the Cell component
 * @property cellId - Unique identifier for the cell (e.g. "A1", "B2")
 * @property isActive - Whether this cell is currently selected/active
 */
interface CellProps {
  cellId: string;
  isActive: boolean;
}

/**
 * Renders an individual cell in the spreadsheet grid
 * 
 * Features:
 * - Displays cell value or formula result
 * - Switches to input mode when active
 * - Handles styling (font, alignment, etc)
 * - Updates cell data on changes
 */
export function Cell({ cellId, isActive }: CellProps) {
  const { setActiveCell, data, updateCell } = useSpreadsheetContext();

  const handleChange = async (value: string) => {
    try {
      // 1. Update local state through context
      updateCell(cellId, { value });

      // 2. Save to database
      const [sheetId, cellCoord] = cellId.split('_');
      await fetch('/api/cells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetId,
          cellId: cellCoord,
          value,
          metadata: {
            formula: value.startsWith('=') ? value : undefined
          }
        })
      });
    } catch (error) {
      console.error('Failed to update cell:', error);
      // Optionally revert the local update on error
    }
  };

  // If cell contains a formula (starts with =), evaluate it
  // Otherwise just display the raw value
  const displayValue = data[cellId]?.value?.startsWith('=') 
    ? evaluateFormula(data[cellId]?.value, data) 
    : data[cellId]?.value;

  // Get cell styling properties, defaulting to empty object
  const style = data[cellId]?.style || {};
  
  return (
    <td
      // Apply base cell styles and highlight if active
      className={cn(
        'border min-w-[100px] h-8 px-2 relative',
        isActive && 'bg-primary/10'
      )}
      onClick={() => setActiveCell(cellId)}
      // Apply custom styling from cell data
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
        // When active, show input field for editing
        <Input
          value={data[cellId]?.value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setActiveCell(null)}
          className="absolute inset-0 border-2 border-primary"
          autoFocus
        />
      ) : (
        // When inactive, show cell value with truncation
        <span className="truncate block">{displayValue}</span>
      )}
    </td>
  );
}