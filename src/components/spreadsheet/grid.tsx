'use client';

// Import necessary dependencies
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect } from 'react';
import { CellStyle, Selection } from '@/lib/types';

import axios from 'axios';
import { Cell } from './cell';

interface CellCoords {
  col: string;
  row: number;
}

// Interface for context menu state and position
interface ContextMenuState {
  x: number;
  y: number;
  type: 'row' | 'column' | null;
  index?: number | string;
}

// Helper function to get data from selected cells
const getSelectedCellsData = async (
  activeSheet: any,
  selection: { start: string; end: string }
) => {
  if (!selection || !activeSheet) return '';

  const startCoords = getCellCoords(selection.start);
  const endCoords = getCellCoords(selection.end);

  const minCol = Math.min(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
  const maxCol = Math.max(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
  const minRow = Math.min(startCoords.row, endCoords.row);
  const maxRow = Math.max(startCoords.row, endCoords.row);

  let data = '';
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const cellId = `${String.fromCharCode(col)}${row}`;
      const response = await axios.get('/api/cells', {
        params: {
          sheetId: activeSheet.id,
          cellId
        }
      });
      data += (response.data.success ? response.data.data.value : '') + '\t';
    }
    data = data.slice(0, -1) + '\n';
  }
  return data.trim();
};

// Parse cell ID into coordinates
const getCellCoords = (cellId: string): CellCoords => {
  const col = cellId.match(/[A-Z]+/)?.[0] || 'A';
  const row = parseInt(cellId.match(/\d+/)?.[0] || '1');
  return { col, row };
};

// Update the loadCell function

export function Grid() {
  const {
    activeCell,
    setActiveCell,
    activeSheet,
    selection,
    setSelection,
    updateCell
  } = useSpreadsheetContext();
  
  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (cellId: string) => {
    setActiveCell(cellId);
    setStartCell(cellId);
      setIsDragging(true);
      setSelection({ start: cellId, end: cellId });
  };

  const handleMouseEnter = (cellId: string) => {
    if (isDragging && startCell) {
      setSelection({ start: startCell, end: cellId });
    }
  };

  const handleDoubleClick = (cellId: string) => {
    setActiveCell(cellId);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setStartCell(null);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Generate columns (A-Z)
  const columns = Array.from({ length: 26 }, (_, i) => 
    String.fromCharCode(65 + i)
  );

  // Generate rows (1-100)
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  if (!activeSheet) return null;

  return (
    <div 
      ref={gridRef}
      className="flex-1 overflow-auto relative bg-white"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="inline-block min-w-full">
        {/* Header row */}
        <div className="sticky top-0 z-10 bg-gray-50">
    <div className="flex">
            <div className="w-10 h-6 border-b border-r border-gray-300 bg-gray-50" />
            {columns.map((col) => (
        <div
          key={col}
                className="w-24 h-6 border-b border-r border-gray-300 flex items-center justify-center text-sm text-gray-600 bg-gray-50"
        >
          {col}
        </div>
      ))}
    </div>
        </div>

        {/* Grid cells */}
        <div>
          {rows.map((row) => (
            <div key={row} className="flex">
              {/* Row number */}
              <div className="sticky left-0 w-10 h-6 border-b border-r border-gray-300 flex items-center justify-center text-sm text-gray-600 bg-gray-50">
                {row}
      </div>
              {/* Cells */}
              {columns.map((col) => {
                  const cellId = `${col}${row}`;
                  return (
                    <Cell
                      key={cellId}
                      cellId={cellId}
                      isActive={activeCell === cellId}
                      isDragging={isDragging}
                    style={{
                      width: 96,
                      height: 24
                    }}
                      onMouseEnter={() => handleMouseEnter(cellId)}
                      onClick={() => handleMouseDown(cellId)}
                    onDoubleClick={() => handleDoubleClick(cellId)}
                    />
                  );
                })}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
