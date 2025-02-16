'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { CellStyle } from '@/lib/types';
import { Cell } from './cell';

interface CellsProps {
  rows: number[];
  columns: string[];
  getCellStyles: (cellStyle: CellStyle) => React.CSSProperties;
  isDragging: boolean;
  setIsDragging: (isDragging: boolean) => void;
}

export function Cells({
  rows,
  columns,
  getCellStyles,
  isDragging,
  setIsDragging,
}: CellsProps) {
  const { 
    activeCell, 
    setActiveCell,
    activeSheet,
    selection,
    setSelection,
  } = useSpreadsheetContext();

  // Handle single cell click
  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging) {
      setActiveCell(cellId);
      setSelection({ start: cellId, end: cellId });
    }
  };

  // Handle mouse enter during drag selection
  const handleMouseEnter = (cellId: string) => {
    if (isDragging && selection) {
      setSelection({ ...selection, end: cellId });
    }
  };

  return (
    <div className="flex-1">
      {rows.map((row) => (
        <div key={row} className="flex h-[20px]">
          {columns.map((col) => {
            const cellId = `${col}${row}`;
            const cell = activeSheet.getCell(cellId);
            const isActive = activeCell === cellId;
            const style = getCellStyles(cell.style);

            return (
              <Cell
                key={cellId}
                cellId={cellId}
                isActive={isActive}
                isDragging={isDragging}
                style={style}
                onMouseEnter={() => handleMouseEnter(cellId)}
                onClick={(e) => handleCellClick(cellId, e)}
                onDoubleClick={() => {
                  setActiveCell(cellId);
                }}
              >
                <div
                  className="px-1 truncate h-full flex items-center"
                  style={style}
                >
                  {cell.getValue()?.toString() ?? ''}
                </div>
              </Cell>
            );
          })}
        </div>
      ))}
    </div>
  );
}