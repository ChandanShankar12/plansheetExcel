'use client';

import { useSpreadsheetContext } from '@/hooks/spreadsheet-context';
import { CellController } from '@/server/controllers/cell-controller';
import { FileHandler } from '@/server/services/file/file-handler';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface CellProps {
  cellId: string;
  isActive: boolean;
  isDragging: boolean;
  style: React.CSSProperties;
  onMouseEnter: () => void;
  onClick: (e: React.MouseEvent) => void;
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
  const { 
    activeSheet,
    updateCell 
  } = useSpreadsheetContext();

  const [editValue, setEditValue] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const cell = activeSheet.getCell(cellId);

  // Start editing when double clicked
  const startEditing = () => {
    const currentValue = cell.getValue();
    setEditValue(currentValue);
    setIsEditing(true);
  };

  // Handle cell value changes
  const handleValueChange = async () => {
    try {
      // Update local state
      CellController.updateCellValue(cell, editValue);
      updateCell(cellId, cell);
      console.log('Cell updated successfully:', cell);

      // Save to Redis cache

    } catch (error) {
      console.error('Error saving cell:', error);
    }
  };

  const stopEditing = () => {
    if (editValue !== null) {
      handleValueChange(editValue);
    }
    setIsEditing(false);
    setEditValue(null);
  };

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Handle double click to start editing
  useEffect(() => {
    if (isActive && !isEditing) {
      const handleKeyPress = (e: KeyboardEvent) => {
        if (!isEditing && e.key.length === 1) {
          startEditing();
        }
      };
      window.addEventListener('keypress', handleKeyPress);
      return () => window.removeEventListener('keypress', handleKeyPress);
    }
  }, [isActive, isEditing]);

  return (
    <div
      className={`
        w-[80px] h-[20px] shrink-0 border-r border-b 
        relative cursor-cell select-none
        ${isActive ? 'ring-2 ring-[#166534] ring-inset' : ''}
        hover:bg-gray-50
      `}
      style={style}
      onClick={onClick}
      onDoubleClick={() => {
        onDoubleClick();
        startEditing();
      }}
      onMouseEnter={onMouseEnter}
    >
      {isEditing && isActive ? (
        <input
          ref={inputRef}
          value={editValue ?? ''}
          onChange={(e) => {
            setEditValue(e.target.value || null);
          }}
          onBlur={stopEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              stopEditing();
            } else if (e.key === 'Escape') {
              setIsEditing(false);
            }
          }}
          className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-white"
          style={style}
          autoFocus
        />
      ) : (
        <div
          className="px-1 truncate h-full flex items-center"
          style={style}
        >
          {cell.getValue() ?? ''}
        </div>
      )}
    </div>
  );
} 