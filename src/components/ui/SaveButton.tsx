'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from './button';
import { CellMetadata } from '@/lib/db/schema';

export function SaveButton() {
  const { data, spreadsheetId } = useSpreadsheetContext();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert cell data to match our schema format
      const cellsToSave = Object.entries(data).map(([cellId, cellData]) => {
        // Convert A1 notation to row/column index
        const colStr = cellId.match(/[A-Z]+/)?.[0] || 'A';
        const rowIndex = parseInt(cellId.match(/\d+/)?.[0] || '1');
        
        // Convert column letters to index (A=1, B=2, etc)
        const columnIndex = colStr.split('').reduce((acc, char) => 
          acc * 26 + char.charCodeAt(0) - 64, 0
        );

        const metadata: CellMetadata = {
          style: cellData.style || {},
          formula: cellData.value?.startsWith('=') ? cellData.value : undefined,
        };

        return {
          userId: 'default-user', // Replace with actual user ID from auth
          sheetId: spreadsheetId.toString(),
          rowIndex,
          columnIndex,
          value: cellData.value || '',
          metadata,
          mergedWith: null
        };
      });

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cellsToSave)
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={saving}
      variant="ghost"
      size="icon"
      className="h-6 w-6"
      title="Save (Ctrl+S)"
    >
      <Image
        src="/Icons/fluent_save-16-regular.svg"
        alt="Save"
        width={16}
        height={16}
        className={saving ? 'opacity-50' : ''}
      />
    </Button>
  );
} 