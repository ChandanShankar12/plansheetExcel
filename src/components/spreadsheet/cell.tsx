'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { CellData } from '@/lib/types';

interface CellProps {
  cellId: string;
  isActive: boolean;
  isDragging: boolean;
  style: React.CSSProperties;
  onMouseEnter: () => void;
  onClick: () => void;
  onDoubleClick: () => void;
}

export function Cell({
  cellId,
  isActive,
  isDragging,
  style,
  onMouseEnter,
  onClick,
  onDoubleClick,
}: CellProps) {
  const { activeSheet, updateCell } = useSpreadsheetContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cellData, setCellData] = useState<CellData | null>(null);

  // Remove the initial fetch effect - we only want to fetch when editing starts
  const handleDoubleClick = async () => {
    onDoubleClick();
    
    // Only fetch data if we haven't loaded it yet
    if (!cellData && activeSheet) {
      try {
        const response = await axios.get<{ success: boolean; data: CellData | null }>('/api/cells/get', {
          params: {
            sheetId: activeSheet.id,
            cellId,
          }
        });

        if (response.data.success && response.data.data) {
          setCellData(response.data.data);
          const value = response.data.data.value?.toString() ?? '';
          setDisplayValue(value);
          setEditValue(value);
        }
      } catch (error) {
        console.error('Failed to fetch cell data:', error);
      }
    } else {
      setEditValue(displayValue);
    }
    
    setIsEditing(true);
  };

  const handleEdit = async () => {
    if (!editValue.trim() || !activeSheet) {
      setIsEditing(false);
      return;
    }

    try {
      const result = await updateCell(cellId, editValue);
      if (result && typeof result === 'object' && 'value' in result) {
        const updatedCell = result as CellData;
        setCellData(updatedCell);
        setDisplayValue(updatedCell.value?.toString() ?? '');
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update cell:', error);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        border-r border-b border-gray-300
        ${isActive ? 'ring-2 ring-blue-500' : ''}
        ${isEditing ? 'z-10' : ''}
      `}
      style={style}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleEdit();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
              setEditValue(displayValue);
            }
          }}
          className="w-full h-full px-1 outline-none"
          autoFocus
        />
      ) : (
        <div className="w-full h-full px-1 truncate flex items-center">
          {displayValue}
        </div>
      )}
    </div>
  );
} 