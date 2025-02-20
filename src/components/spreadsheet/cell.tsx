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
  onDoubleClick
}: CellProps) {
  const { activeSheet, updateCell } = useSpreadsheetContext();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && !isEditing) {
      const cell = activeSheet.getCell(cellId);
      setValue(cell.getValue() || '');
    }
  }, [isActive, cellId, activeSheet, isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
    onDoubleClick?.();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleBlur = async () => {
    if (isEditing) {
      await updateCell(cellId, value);
      setIsEditing(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`
        border-r border-b border-gray-300 
        relative overflow-hidden
        ${isActive ? 'z-10 outline outline-2 outline-blue-500' : ''}
        ${isDragging ? 'bg-blue-50' : ''}
      `}
      style={style}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="absolute inset-0 w-full h-full px-2 outline-none"
          autoFocus
        />
      ) : (
        <div className="px-2 py-1 truncate">{value}</div>
      )}
    </div>
  );
} 