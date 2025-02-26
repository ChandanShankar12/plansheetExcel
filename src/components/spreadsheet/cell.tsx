'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CellData } from '@/lib/types';
import styles from '@/styles/cell.module.css';
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useToast } from '@/hooks/use-toast';

interface CellProps {
  id: string;
  data: CellData | null;
  isActive: boolean;
  onClick: () => void;
  onChange: (value: string) => void;
}

const Cell: React.FC<CellProps> = ({ id, data, isActive, onClick, onChange }) => {
  // Create a default empty cell if data is null
  const cellData = data || { 
    value: '', 
    formula: '', 
    style: {}, 
    isModified: false, 
    lastModified: new Date().toISOString() 
  };

  const [editValue, setEditValue] = useState(cellData.value?.toString() || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateCell } = useSpreadsheet();
  const { toast } = useToast();
  const prevValueRef = useRef(cellData.value);

  // Update local state when cell data changes from props
  useEffect(() => {
    const newValue = cellData.value?.toString() || '';
    if (prevValueRef.current !== newValue) {
      setEditValue(newValue);
      prevValueRef.current = newValue;
    }
  }, [cellData.value]);

  // Focus input when cell becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  const handleBlur = useCallback(async () => {
    // Only update if value has changed and not already updating
    if (isUpdating) return;
    
    if (editValue !== (cellData.value?.toString() || '')) {
      try {
        setIsUpdating(true);
        await updateCell(id, { value: editValue });
        onChange(editValue);
        console.log(`[Cell] Updated cell ${id} with value: ${editValue}`);
      } catch (error) {
        console.error(`[Cell] Error updating cell ${id}:`, error);
        toast({
          title: 'Error updating cell',
          description: error instanceof Error ? error.message : 'An unknown error occurred',
          variant: 'destructive',
        });
        // Revert to previous value on error
        setEditValue(cellData.value?.toString() || '');
      } finally {
        setIsUpdating(false);
      }
    }
  }, [id, editValue, cellData.value, updateCell, onChange, toast, isUpdating]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    }
  }, [handleBlur]);

  return (
    <div 
      className={`${styles.cell} ${isActive ? styles.active : ''} ${isUpdating ? styles.updating : ''}`} 
      onClick={onClick}
      data-cell-id={id}
    >
      {isActive ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={styles.cellInput}
          disabled={isUpdating}
        />
      ) : (
        <div className={styles.cellContent}>
          {cellData.value?.toString() || ''}
        </div>
      )}
    </div>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(Cell); 