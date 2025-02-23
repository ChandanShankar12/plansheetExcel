'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { CellData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CellProps {
  id: string;
  isActive?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
}

export const Cell = memo(function Cell({
  id,
  isActive,
  isDragging,
  onClick,
  onMouseEnter,
  onDoubleClick,
  style
}: CellProps) {
  const { activeSheet, updateCell } = useSpreadsheet();
  const [value, setValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!activeSheet) return;
    const cellData = activeSheet.getCell(id);
    setValue(cellData.value || '');
  }, [id, activeSheet]);

  const handleBlur = useCallback(async () => {
    if (!isEditing) return;
    
    try {
      await updateCell(id, { value });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update cell',
        variant: 'destructive',
      });
    } finally {
      setIsEditing(false);
    }
  }, [id, value, updateCell, isEditing, toast]);

  const handleKeyDown = useCallback(async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [handleBlur]);

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
      style={style}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onDoubleClick={() => {
        setIsEditing(true);
        onDoubleClick?.();
      }}
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
}); 