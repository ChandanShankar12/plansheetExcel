'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CellData } from '@/lib/types';

interface CellProps {
  id: string;
  isActive?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onDoubleClick?: () => void;
}

export function Cell({
  id,
  isActive,
  isDragging,
  onClick,
  onMouseEnter,
  onDoubleClick
}: CellProps) {
  const { activeSheet, updateCell } = useSpreadsheet();
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeSheet) return;
    const cellData = activeSheet.getCell(id);
    setValue(cellData.value || '');
  }, [id, activeSheet]);

  const handleChange = async (newValue: string) => {
    if (!activeSheet) return;
    await updateCell(id, { value: newValue });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    onDoubleClick?.();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleBlur = async () => {
    if (!isEditing) return;
    
    try {
      await updateCell(id, {
        value,
        isModified: true,
        lastModified: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update cell:', error);
    } finally {
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
        w-[100px] h-[24px] 
        border-r border-b border-[#e1e3e6]
        bg-white hover:bg-[#f8f9fa]
        relative select-none
        ${isActive ? 'z-10 outline outline-1 outline-[#1a73e8]' : ''}
        ${isDragging ? 'bg-[#e8f0fe]' : ''}
      `}
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
          className="absolute inset-0 w-full h-full px-[3px] outline-none bg-white text-[13px]"
          autoFocus
        />
      ) : (
        <div className="px-[3px] py-[1px] h-full truncate text-[13px] leading-[22px]">
          {value}
        </div>
      )}
    </div>
  );
} 