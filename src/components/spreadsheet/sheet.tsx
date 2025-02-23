'use client';

import { useSpreadsheet } from '@/context/spreadsheet-context';
import { useState, useCallback, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cell } from './cell';
import { Selection } from '@/lib/types';

// Constants
const COLUMNS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const ROWS = Array.from({ length: 100 }, (_, i) => i + 1);
const CELL_WIDTH = 120;
const CELL_HEIGHT = 25;
const HEADER_WIDTH = 40;
const HEADER_HEIGHT = 25;

// Types
interface CellCoords {
  col: string;
  row: number;
}

interface GridRowProps {
  row: number;
  activeCell: string | null;
  selection: Selection | null;  // Make selection nullable to match context
  isDragging: boolean;
  onCellClick: (id: string) => void;
  onCellDrag: (id: string) => void;
}

// Helper function to parse cell coordinates
const getCellCoords = (cellId: string): CellCoords => {
  const col = cellId.match(/[A-Z]+/)?.[0] || 'A';
  const row = parseInt(cellId.match(/\d+/)?.[0] || '1');
  return { col, row };
};

// Memoized Header Components
const ColumnHeader = memo(function ColumnHeader({ col }: { col: string }) {
  return (
    <div 
      className="flex items-center justify-center bg-[#f8f9fa] border-r border-b border-[#e1e3e6] font-medium text-[12px] text-gray-700"
      style={{ width: CELL_WIDTH, height: HEADER_HEIGHT }}
    >
      {col}
    </div>
  );
});

const RowHeader = memo(function RowHeader({ row }: { row: number }) {
  return (
    <div 
      className="sticky left-0 z-10 flex items-center justify-center bg-[#f8f9fa] border-r border-b border-[#e1e3e6] font-medium text-[12px] text-gray-700"
      style={{ width: HEADER_WIDTH, height: CELL_HEIGHT }}
    >
      {row}
    </div>
  );
});

const CornerHeader = memo(() => (
  <div 
    className="sticky left-0 top-0 z-20 bg-[#f8f9fa] border-r border-b border-[#e1e3e6]"
    style={{ width: HEADER_WIDTH, height: HEADER_HEIGHT }}
  />
));

const LoadingOverlay = memo(() => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-white/50 flex items-center justify-center z-50"
  >
    <div className="text-gray-700">Loading...</div>
  </motion.div>
));

// Row Component
const GridRow = memo(function GridRow({ 
  row, 
  activeCell,
  selection,
  isDragging,
  onCellClick,
  onCellDrag 
}: GridRowProps) {
  return (
    <div className="flex">
      <RowHeader row={row} />
      <div className="flex">
        {COLUMNS.map(col => {
          const id = `${col}${row}`;
          const isSelected = selection?.start === id || selection?.end === id;
          return (
            <Cell
              key={id}
              id={id}
              isActive={activeCell === id}
              isDragging={isDragging && isSelected}
              onMouseEnter={() => onCellDrag(id)}
              onClick={() => onCellClick(id)}
              style={{ width: CELL_WIDTH, height: CELL_HEIGHT }}
            />
          );
        })}
      </div>
    </div>
  );
});

// Main Component
export const Sheet = memo(function Sheet() {
  const { 
    activeSheet,
    activeCell,
    selection,
    isTransitioning,
    setActiveCell,
    setSelection 
  } = useSpreadsheet();

  const [isDragging, setIsDragging] = useState(false);

  const handleCellClick = useCallback((id: string) => {
    setActiveCell(id);
    setSelection(null);
    setIsDragging(true);
  }, [setActiveCell, setSelection]);

  const handleCellDrag = useCallback((id: string) => {
    if (!isDragging || !activeCell) return;
    setSelection({
      start: activeCell,
      end: id
    });
  }, [isDragging, activeCell, setSelection]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  if (!activeSheet) return null;

  return (
    <div className="relative w-full h-full overflow-auto bg-white">
      <div 
        className="absolute inset-0"
        style={{
          width: HEADER_WIDTH + (CELL_WIDTH * COLUMNS.length),
          minHeight: HEADER_HEIGHT + (CELL_HEIGHT * ROWS.length)
        }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 grid-lines" />

        {/* Headers and Cells */}
        <div className="relative">
          {/* Column headers */}
          <div className="sticky top-0 z-10 flex">
            <CornerHeader />
            {COLUMNS.map(col => (
              <ColumnHeader key={col} col={col} />
            ))}
          </div>

          {/* Rows */}
          <div className="relative">
            {ROWS.map(row => (
              <GridRow
                key={row}
                row={row}
                activeCell={activeCell}
                selection={selection}
                isDragging={isDragging}
                onCellClick={handleCellClick}
                onCellDrag={handleCellDrag}
              />
            ))}
          </div>
        </div>
      </div>

      {isTransitioning && <LoadingOverlay />}
    </div>
  );
});
