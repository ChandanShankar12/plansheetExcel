'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';
import { CellData, CellStyle } from '@/lib/spreadsheet/types';
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
  const { activeCell, data, activeSheetId, setActiveCell, selection, setSelection, updateCell, userId } = useSpreadsheetContext();

  // State for cell editing
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add function to call API
  const saveCellToApi = useCallback(async (cellId: string, value: string) => {
    try {
      const response = await fetch('/api/cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          sheetId: activeSheetId,
          cellId,
          value,
          formula: value.startsWith('=') ? value : undefined,
        }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error('Failed to save cell');
      }
    } catch (error) {
      console.error('Error saving cell:', error);
    }
  }, [activeSheetId, userId]);

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

  // Handle double click to start cell editing
  const handleCellDoubleClick = (cellId: string) => {
    setActiveCell(cellId);
    setIsEditing(true);
    const cellKey = `${activeSheetId}_${cellId}`;
    setEditValue(data[cellKey]?.value || '');
  };

  // Update stopEditing to include API call
  const stopEditing = () => {
    if (activeCell && editValue !== data[`${activeSheetId}_${activeCell}`]?.value) {
      updateCell(`${activeSheetId}_${activeCell}`, { value: editValue });
      saveCellToApi(activeCell, editValue);
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
      {rows.map((row: number) => (
        <div key={row} className="flex h-[20px]">
          {columns.map((col: string) => {
            const cellId: string = `${col}${row}`;
            const cellKey: string = `${activeSheetId}_${cellId}`;
            const cellData: CellData | undefined = data[cellKey];
            const isActive: boolean = activeCell === cellId;
            const cellStyle: CellStyle = cellData?.style || {};
            const computedStyles: React.CSSProperties = getCellStyles(cellStyle);

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
                onClick={(e: React.MouseEvent) => handleCellClick(cellId, e)}
                onDoubleClick={() => handleCellDoubleClick(cellId)}
                
              >
                {isEditing && isActive ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditValue(e.target.value)
                    }
                    onBlur={stopEditing}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        stopEditing();
                      } else if (e.key === 'Escape') {
                        stopEditing();
                        setEditValue(data[cellKey]?.value || '');
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
                    {cellData?.value
                      ? evaluateFormula(cellData.value, data)
                      : ''}
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