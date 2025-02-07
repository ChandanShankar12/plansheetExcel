'use client';

// Import necessary dependencies
import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { useState, useRef, useEffect } from 'react';
import { CellStyle } from '@/lib/spreadsheet/types';
import { Cells } from './cells';


// Interface for cell selection with start and end coordinates
interface Selection {
  start: string;
  end: string;
}

// Interface for context menu state and position
interface ContextMenuState {
  x: number;
  y: number;
  type: 'row' | 'column' | null;
  index?: number | string;
}

export function Grid() {
  // Get spreadsheet context values and functions
  const {
    activeCell,
    setActiveCell,
    data,
    updateCell,
    undo,
    redo,
    canUndo,
    canRedo,
    setData,
    activeSheetId,
    selection,
    setSelection,
  } = useSpreadsheetContext();

  // State for context menu
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // State for column/row resizing
  const [resizing, setResizing] = useState<{
    type: 'row' | 'column';
    index: number | string;
    startPos: number;
    startSize: number;
  } | null>(null);

  // State for column widths and row heights
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Generate column letters (A-Z) and row numbers (1-100)
  const columns = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  );
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  // Helper function to convert cell ID (e.g. 'A1') to coordinates
  const getCellCoords = (cellId: string) => {
    const col = cellId.match(/[A-Z]+/)?.[0] || '';
    const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
    return { col, row };
  };

  // Check if a cell is within the current selection range
  const isCellSelected = (cellId: string) => {
    if (!selection) return false;
    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);
    const { col, row } = getCellCoords(cellId);

    const minCol = String.fromCharCode(
      Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0))
    );
    const maxCol = String.fromCharCode(
      Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0))
    );
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
  };

  // Handle single cell click
  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isDragging) {
      setActiveCell(cellId);
      setSelection({ start: cellId, end: cellId });
    }
  };

  // Handle mouse down for starting cell selection
  const handleMouseDown = (cellId: string) => {
    if (!isDragging) {
      setIsDragging(true);
      setActiveCell(cellId);
      setSelection({ start: cellId, end: cellId });
    }
  };

  // Handle mouse enter during drag selection
  const handleMouseEnter = (cellId: string) => {
    if (isDragging && selection) {
      setSelection({ 
        start: selection.start, 
        end: cellId 
      });
    }
  };

  // Handle mouse up to end drag selection
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global mouse up listener
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle double click to start cell editing
  const handleCellDoubleClick = (cellId: string) => {
    setActiveCell(cellId);
    setIsDragging(true);
  };

  // Handle keyboard shortcuts and navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || isDragging) return;

      // Save (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveButton = document.querySelector(
          'button[title="Save (Ctrl+S)"]'
        );
        if (saveButton instanceof HTMLButtonElement) {
          saveButton.click();
        }
      }

      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selectedCells = selection
          ? getSelectedCellsData()
          : data[`${activeSheetId}_${activeCell}`]?.value || '';
        navigator.clipboard.writeText(selectedCells);
      }

      // Cut (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        const selectedCells = selection
          ? getSelectedCellsData()
          : data[`${activeSheetId}_${activeCell}`]?.value || '';
        navigator.clipboard.writeText(selectedCells);
        if (selection) {
          clearSelectedCells();
        } else {
          updateCell(activeCell, { value: '' });
        }
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        navigator.clipboard.readText().then((text) => {
          if (selection) {
            pasteToSelection(text);
          } else {
            updateCell(activeCell, { value: text });
          }
        });
      }

      // Start editing on F2 or when typing any character
      if (
        e.key === 'F2' ||
        (!isDragging && e.key.length === 1 && !e.ctrlKey && !e.metaKey)
      ) {
        handleCellDoubleClick(activeCell);
      }

      // Finish editing on Enter
      if (e.key === 'Enter') {
        handleMouseUp();
      }

      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Redo (Ctrl/Cmd + Shift + Z) or (Ctrl/Cmd + Y)
      if (
        (e.ctrlKey || e.metaKey) &&
        ((e.shiftKey && e.key === 'z') || e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCell,
    data,
    isDragging,
    selection,
    updateCell,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // Helper function to get data from selected cells
  const getSelectedCellsData = () => {
    if (!selection) return '';
    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);

    const minCol = Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const maxCol = Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    let result = '';
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        result += (data[`${activeSheetId}_${cellId}`]?.value || '') + '\t';
      }
      result = result.trim() + '\n';
    }
    return result.trim();
  };

  // Clear all cells in selection
  const clearSelectedCells = () => {
    if (!selection) return;
    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);

    const minCol = Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const maxCol = Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        updateCell(cellId, { value: '' });
      }
    }
  };

  // Paste data into selected cells
  const pasteToSelection = (text: string) => {
    const rows = text.split('\n');
    const startCell = selection?.start || activeCell;
    if (!startCell) return;

    const { col: startCol, row: startRow } = getCellCoords(startCell);
    rows.forEach((row, rowIndex) => {
      const cells = row.split('\t');
      cells.forEach((cell, colIndex) => {
        const newCol = String.fromCharCode(startCol.charCodeAt(0) + colIndex);
        const newRow = startRow + rowIndex;
        const cellId = `${newCol}${newRow}`;
        updateCell(cellId, { value: cell });
      });
    });
  };

  // Get selection edge information for a cell
  const getSelectionBounds = (cellId: string) => {
    if (!selection)
      return {
        isTopEdge: false,
        isRightEdge: false,
        isBottomEdge: false,
        isLeftEdge: false,
      };

    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);
    const { col, row } = getCellCoords(cellId);

    const minCol = String.fromCharCode(
      Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0))
    );
    const maxCol = String.fromCharCode(
      Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0))
    );
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return {
      isTopEdge: row === minRow,
      isRightEdge: col === maxCol,
      isBottomEdge: row === maxRow,
      isLeftEdge: col === minCol,
    };
  };

  // Handle right-click on column header
  const handleHeaderContextMenu = (e: React.MouseEvent, col: string) => {
    e.preventDefault();
    // Select the entire column before showing context menu
    const firstCell = `${col}1`;
    const lastCell = `${col}${rows.length}`;
    setSelection({ start: firstCell, end: lastCell });
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'column',
      index: col,
    });
  };

  // Handle right-click on row header
  const handleRowContextMenu = (e: React.MouseEvent, row: number) => {
    e.preventDefault();
    // Select the entire row before showing context menu
    const firstCell = `A${row}`;
    const lastCell = `${String.fromCharCode(65 + columns.length - 1)}${row}`;
    setSelection({ start: firstCell, end: lastCell });
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type: 'row',
      index: row,
    });
  };

  // Clear content from a column
  const clearColumnContent = (col: string) => {
    const newData = { ...data };
    // Only clear the content, keep the column
    rows.forEach((row) => {
      const cellId = `${col}${row}`;
      if (newData[`${activeSheetId}_${cellId}`]) {
        newData[`${activeSheetId}_${cellId}`] = {
          ...newData[`${activeSheetId}_${cellId}`],
          value: '',
        };
      }
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  // Clear content from a row
  const clearRowContent = (row: number) => {
    const newData = { ...data };
    // Only clear the content, keep the row
    columns.forEach((col) => {
      const cellId = `${col}${row}`;
      if (newData[`${activeSheetId}_${cellId}`]) {
        newData[`${activeSheetId}_${cellId}`] = {
          ...newData[`${activeSheetId}_${cellId}`],
          value: '',
        };
      }
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  // Delete a column and shift remaining columns left
  const deleteColumn = (col: string) => {
    const newData = { ...data };
    // Delete the column and shift remaining columns left
    rows.forEach((row) => {
      let currentCol = col;
      while (currentCol < 'Z') {
        const nextCol = String.fromCharCode(currentCol.charCodeAt(0) + 1);
        const currentCellId = `${currentCol}${row}`;
        const nextCellId = `${nextCol}${row}`;
        newData[`${activeSheetId}_${currentCellId}`] = newData[
          `${activeSheetId}_${nextCellId}`
        ] || { value: '' };
        currentCol = nextCol;
      }
      // Delete the last column
      delete newData[`${activeSheetId}_${col}${row}`];
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  // Delete a row and shift remaining rows up
  const deleteRow = (row: number) => {
    const newData = { ...data };
    // Delete the row and shift remaining rows up
    columns.forEach((col) => {
      let currentRow = row;
      while (currentRow < rows.length) {
        const nextRow = currentRow + 1;
        const currentCellId = `${col}${currentRow}`;
        const nextCellId = `${col}${nextRow}`;
        newData[`${activeSheetId}_${currentCellId}`] = newData[
          `${activeSheetId}_${nextCellId}`
        ] || { value: '' };
        currentRow = nextRow;
      }
      // Delete the last row
      delete newData[`${activeSheetId}_${col}${rows.length}`];
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  // Start column/row resize operation
  const handleResizeStart = (
    e: React.MouseEvent,
    type: 'row' | 'column',
    index: number | string,
    currentSize: number
  ) => {
    e.preventDefault();
    setResizing({
      type,
      index,
      startPos: type === 'column' ? e.clientX : e.clientY,
      startSize: currentSize,
    });
  };

  // Handle resize movement
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizing.type === 'column') {
        const diff = e.clientX - resizing.startPos;
        const newWidth = Math.max(40, resizing.startSize + diff);
        setColumnWidths((prev) => ({
          ...prev,
          [resizing.index]: newWidth,
        }));
      } else {
        const diff = e.clientY - resizing.startPos;
        const newHeight = Math.max(20, resizing.startSize + diff);
        setRowHeights((prev) => ({
          ...prev,
          [resizing.index as number]: newHeight,
        }));
      }
    };

    const handleMouseUp = () => {
      setResizing(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing]);

  // Get computed styles for a cell
  const getCellStyles = (cellStyle: CellStyle = {}) => ({
    fontFamily: cellStyle.fontFamily || 'Arial, sans-serif',
    fontSize: cellStyle.fontSize ? `${cellStyle.fontSize}px` : '12px',
    fontWeight: cellStyle.bold ? 'bold' : 'normal',
    fontStyle: cellStyle.italic ? 'italic' : 'normal',
    textDecoration: cellStyle.underline ? 'underline' : 'none',
    color: cellStyle.textColor || '#000',
    backgroundColor: cellStyle.backgroundColor || 'transparent',
    textAlign: cellStyle.align || 'left',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  });

  return (
    <div className="relative w-full">
      {/* Header row with corner cell */}
      <div className="sticky top-0 z-10 flex bg-white">
        {/* Corner cell */}
        <div className="sticky left-0 z-20 w-[40px] h-[24px] bg-[#f8f9fa] border-r border-b flex items-center justify-center">
          <div className="w-full h-full bg-[#f8f9fa] border-r border-b" />
        </div>

        {/* Column headers */}
        {columns.map((col) => (
          <div key={col} className="relative">
            <div
              className={`
                w-[80px] h-[24px] shrink-0 border-r border-b 
                bg-[#f8f9fa] text-[#666] font-medium
                flex items-center justify-center text-xs
                hover:bg-gray-100 cursor-pointer
                ${selection?.start.startsWith(col) ? 'bg-[#e6f0eb]' : ''}
              `}
              onContextMenu={(e) => handleHeaderContextMenu(e, col)}
            >
              {col}
            </div>
            {/* Column resize handle */}
            <div className="resize-handle-col" />
          </div>
        ))}
      </div>

      {/* Grid content */}
      <div className="flex">
        {/* Row numbers */}
        <div className="sticky left-0 z-10 bg-white">
          {rows.map((row) => (
            <div key={row} className="relative">
              <div
                className={`
                  w-[40px] h-[20px] shrink-0 border-r border-b 
                  bg-[#f8f9fa] text-[#666] font-medium
                  flex items-center justify-center text-xs
                  hover:bg-gray-100 cursor-pointer
                  ${selection?.start.endsWith(row.toString()) ? 'bg-[#e6f0eb]' : ''}
                `}
                onContextMenu={(e) => handleRowContextMenu(e, row)}
              >
                {row}
              </div>
              {/* Row resize handle */}
              <div className="resize-handle-row" />
            </div>
          ))}
        </div>

        {/* Cells Grid Container */}
        <Cells
          rows={rows}
          columns={columns}
          getCellStyles={getCellStyles}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        />
      </div>
    </div>
  );
}
