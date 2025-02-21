'use client';

// Import necessary dependencies
import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect } from 'react';
import { CellStyle, Selection, CellData } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

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

export function Sheet() {
  const { 
    activeSheet,
    isTransitioning,
    activeCell,
    selection,
    setActiveCell,
    setSelection
  } = useSpreadsheet();

  const [isDragging, setIsDragging] = useState(false);
  const [startCell, setStartCell] = useState<string | null>(null);

  useEffect(() => {
    setIsDragging(false);
    setStartCell(null);
    setSelection(null);
    setActiveCell(null);
  }, [activeSheet?.getId(), setSelection, setActiveCell]);

  const handleCellClick = (id: string) => {
    setActiveCell(id);
    setStartCell(id);
    setIsDragging(true);
    setSelection({ start: id, end: id });
  };

  const handleCellDrag = (id: string) => {
    if (isDragging && startCell) {
      setSelection({ start: startCell, end: id });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate grid
  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  if (!activeSheet) return null;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="inline-block min-w-full">
          <div className="relative">
            {/* Fixed corner */}
            <div className="sticky top-0 left-0 z-30 w-[48px] h-[24px] bg-[#f8f9fa] border-b border-r border-[#e1e3e6]" />

            {/* Column headers */}
            <div className="sticky top-0 z-20 ml-[48px] flex">
              {columns.map((col) => (
                <div
                  key={col}
                  className="flex-none w-[100px] h-[24px] border-b border-r border-[#e1e3e6] flex items-center justify-center text-[11px] text-[#333] bg-[#f8f9fa] font-medium"
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Row headers and cells */}
            <div className="relative">
              {rows.map(row => (
                <div key={row} className="flex">
                  {/* Row header */}
                  <div className="sticky left-0 z-10 w-[48px] h-[24px] border-b border-r border-[#e1e3e6] flex items-center justify-center text-[11px] text-[#333] bg-[#f8f9fa] font-medium">
                    {row}
                  </div>
                  {/* Cells */}
                  <div className="flex min-w-max">
                    {columns.map(col => {
                      const id = `${col}${row}`;
                      const isSelected = selection?.start === id || selection?.end === id;
                      return (
                        <Cell
                          key={id}
                          id={id}
                          isActive={activeCell === id}
                          isDragging={isDragging && isSelected}
                          onMouseEnter={() => handleCellDrag(id)}
                          onClick={() => handleCellClick(id)}
                          onDoubleClick={() => handleCellClick(id)}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white/50 flex items-center justify-center z-50"
        >
          <div className="text-gray-500">Loading...</div>
        </motion.div>
      )}
    </div>
  );
}
