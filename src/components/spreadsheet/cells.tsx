'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { CellController } from '@/server/controllers/cell-controller';
import { SheetController } from '@/server/controllers/sheet-controller';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { CellStyle } from '@/lib/types';
import { useState, useRef, useEffect, useCallback } from 'react';

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
    updateCell, 
    selection,
    setSelection,
    userId 
  } = useSpreadsheetContext();

  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle single cell click
  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isEditing) {
      setActiveCell(cellId);
      if (!isDragging) {
        setSelection({ start: cellId, end: cellId });
      }
    }
  };

  // Handle mouse enter during drag selection
  const handleMouseEnter = (cellId: string) => {
    if (isDragging && selection) {
      setSelection({ ...selection, end: cellId });
    }
  };

  // Handle double click to start cell editing
  const handleCellDoubleClick = (cellId: string) => {
    setActiveCell(cellId);
    setIsEditing(true);
    const cell = SheetController.getCell(activeSheet, cellId);
    setEditValue(cell.getValue());
  };

  // Save cell value to backend
  const saveCellToApi = useCallback(async (cellId: string, cell: Cell) => {
    try {
      const response = await fetch('/api/cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sheetId: activeSheet.id,
          cellId,
          value: cell.getValue(),
          formula: cell.getFormula(),
          style: cell.style
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save cell');
      }
    } catch (error) {
      console.error('Error saving cell:', error);
    }
  }, [activeSheet.id, userId]);

  // Stop editing and save cell value
  const stopEditing = () => {
    if (activeCell) {
      const cell = SheetController.getCell(activeSheet, activeCell);
      CellController.updateCellValue(cell, editValue);
      updateCell(activeCell, cell);
      saveCellToApi(activeCell, cell);
    }
    setIsEditing(false);
    setEditValue('');
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div className="flex-1">
      {rows.map((row) => (
        <div key={row} className="flex h-[20px]">
          {columns.map((col) => {
            const cellId = `${col}${row}`;
            const cell = SheetController.getCell(activeSheet, cellId);
            const isActive = activeCell === cellId;
            const computedStyles = getCellStyles(cell.style);

            return (
              <div
                key={cellId}
                className={`
                  w-[80px] h-[20px] shrink-0 border-r border-b 
                  relative cursor-cell select-none
                  ${isActive ? 'ring-2 ring-[#166534] ring-inset' : ''}
                  hover:bg-gray-50
                `}
                style={computedStyles}
                onClick={(e) => handleCellClick(cellId, e)}
                onDoubleClick={() => handleCellDoubleClick(cellId)}
                onMouseEnter={() => handleMouseEnter(cellId)}
              >
                {isEditing && isActive ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={stopEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        stopEditing();
                      } else if (e.key === 'Escape') {
                        setIsEditing(false);
                        setEditValue(cell.getValue());
                      }
                    }}
                    className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-white"
                    style={{
                      ...computedStyles,
                      lineHeight: '20px',
                    }}
                    autoFocus
                  />
                ) : (
                  <div
                    className="px-1 truncate h-full flex items-center"
                    style={computedStyles}
                  >
                    {CellController.evaluateCell(cell, activeSheet)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
} 