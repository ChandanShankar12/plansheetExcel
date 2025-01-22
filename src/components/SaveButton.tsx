'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { storage } from '@/lib/db/services/json-storage';
import { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';

export function SaveButton() {
  const { data, spreadsheetId } = useSpreadsheetContext();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create initial spreadsheet if it doesn't exist
      if (!storage.getSpreadsheet(spreadsheetId)) {
        storage.createSpreadsheet('My Spreadsheet');
      }

      // Save each cell's data
      Object.entries(data).forEach(([cellId, cellData]) => {
        storage.updateCell(spreadsheetId, cellId, {
          value: cellData.value || '',
          formula: cellData.value?.startsWith('=') ? cellData.value : undefined,
          style: cellData.style || {},
          metadata: cellData.metadata || {}
        });
      });

      // Save to JSON files through API
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storage.getAllData())
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

  // Helper function to get cell coordinates
  const getCellCoords = (cellId: string) => {
    const col = cellId.match(/[A-Z]+/)?.[0] || '';
    const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
    return { col, row };
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