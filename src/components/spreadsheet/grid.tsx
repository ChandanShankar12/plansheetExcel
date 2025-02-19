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
const loadCell = async (cellId: string) => {
  if (!activeSheet) return null;

  try {
    const response = await axios.get('/api/cells/get', {  // Changed from /api/cells to /api/cells/get
      params: {
        sheetId: activeSheet.id,
        cellId,
      }
    });

    if (response.data.success) {
      const cellData = response.data.data;
      if (cellData) {  // Only update if we got actual data
        const cell = activeSheet.getCell(cellId);
        if (cell) {
          cell.setValue(cellData.value);
          cell.setFormula(cellData.formula);
          cell.style = cellData.style;
        }
        return cellData;
      }
    }
  } catch (error) {
    console.error('Failed to load cell:', error);
  }
  return null;
};

export function Grid() {
  // Get spreadsheet context values and functions
  const {
    activeCell,
    setActiveCell,
    activeSheet,
    updateCell,
    undo,
    redo,
    canUndo,
    canRedo,
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
  const [columns] = useState(() =>
    Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
  );
  const [rows] = useState(() => Array.from({ length: 100 }, (_, i) => i + 1));

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
      setSelection({ ...selection, end: cellId });
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
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (!activeCell || !activeSheet) return;

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
        e.preventDefault();
        const data = await getSelectedCellsData(activeSheet, selection);
        await navigator.clipboard.writeText(data);
      }

      // Cut (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault();
        await copySelectedCells();
        await clearSelectedCells();
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        const text = await navigator.clipboard.readText();
        if (selection) {
          await pasteToSelection(text);
        } else {
          await axios.post('/api/cells', {
            sheetId: activeSheet.id,
            cellId: activeCell,
            value: text
          });
        }
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

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey && canRedo) {
          e.preventDefault();
          redo();
        } else if (canUndo) {
          e.preventDefault();
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    activeCell,
    activeSheet,
    isDragging,
    selection,
    updateCell,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  // Clear all cells in selection
  const clearSelectedCells = async () => {
    if (!selection || !activeSheet) return;

    try {
      const startCoords = getCellCoords(selection.start);
      const endCoords = getCellCoords(selection.end);

      const minCol = Math.min(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
      const maxCol = Math.max(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
      const minRow = Math.min(startCoords.row, endCoords.row);
      const maxRow = Math.max(startCoords.row, endCoords.row);

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cellId = `${String.fromCharCode(col)}${row}`;
          await axios.delete('/api/cells', {
            params: {
              sheetId: activeSheet.id,
              cellId
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to clear cells:', error);
    }
  };

  // Copy selected cells data
  const copySelectedCells = async () => {
    if (!selection || !activeSheet) return;

    try {
      const startCoords = getCellCoords(selection.start);
      const endCoords = getCellCoords(selection.end);

      const minCol = Math.min(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
      const maxCol = Math.max(startCoords.col.charCodeAt(0), endCoords.col.charCodeAt(0));
      const minRow = Math.min(startCoords.row, endCoords.row);
      const maxRow = Math.max(startCoords.row, endCoords.row);

      let copyData = '';
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cellId = `${String.fromCharCode(col)}${row}`;
          const response = await axios.get('/api/cells', {
            params: {
              sheetId: activeSheet.id,
              cellId
            }
          });
          copyData += (response.data.success ? response.data.data.value : '') + '\t';
        }
        copyData = copyData.slice(0, -1) + '\n';
      }

      await navigator.clipboard.writeText(copyData.trim());
    } catch (error) {
      console.error('Failed to copy cells:', error);
    }
  };

  // Paste data to selection
  const pasteToSelection = async (text: string) => {
    if (!selection || !activeSheet) return;

    const rows = text.split('\n');
    const startCoords = getCellCoords(selection.start);

    try {
      for (let i = 0; i < rows.length; i++) {
        const cells = rows[i].split('\t');
        for (let j = 0; j < cells.length; j++) {
          const col = String.fromCharCode(startCoords.col.charCodeAt(0) + j);
          const row = startCoords.row + i;
          const cellId = `${col}${row}`;

          await axios.post('/api/cells', {
            sheetId: activeSheet.id,
            cellId,
            value: cells[j]
          });
        }
      }
    } catch (error) {
      console.error('Failed to paste cells:', error);
    }
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
  const clearColumnContent = async (col: string) => {
    if (!activeSheet) return;

    try {
      for (const row of rows) {
        const cellId = `${col}${row}`;
        await axios.delete('/api/cells', {
          params: {
            sheetId: activeSheet.id,
            cellId
          }
        });
      }
      setSelection(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to clear column:', error);
    }
  };

  // Clear content from a row
  const clearRowContent = async (row: number) => {
    if (!activeSheet) return;

    try {
      for (const col of columns) {
        const cellId = `${col}${row}`;
        await axios.delete('/api/cells', {
          params: {
            sheetId: activeSheet.id,
            cellId
          }
        });
      }
      setSelection(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to clear row:', error);
    }
  };

  // Delete a column
  const deleteColumn = async (col: string) => {
    if (!activeSheet) return;

    try {
      // First clear the column
      await clearColumnContent(col);

      // Then shift remaining columns left
      const colIndex = columns.indexOf(col);
      if (colIndex === -1) return;

      for (let i = colIndex + 1; i < columns.length; i++) {
        for (const row of rows) {
          const fromCellId = `${columns[i]}${row}`;
          const toCellId = `${columns[i - 1]}${row}`;

          // Get data from the right cell
          const response = await axios.get('/api/cells', {
            params: {
              sheetId: activeSheet.id,
              cellId: fromCellId
            }
          });

          if (response.data.success) {
            // Move data to the left cell
            await axios.post('/api/cells', {
              sheetId: activeSheet.id,
              cellId: toCellId,
              value: response.data.data.value,
              formula: response.data.data.formula,
              style: response.data.data.style
            });

            // Clear the right cell
            await axios.delete('/api/cells', {
              params: {
                sheetId: activeSheet.id,
                cellId: fromCellId
              }
            });
          }
        }
      }

      setSelection(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  };

  // Delete a row
  const deleteRow = async (row: number) => {
    if (!activeSheet) return;

    try {
      // First clear the row
      await clearRowContent(row);

      // Then shift remaining rows up
      for (let i = row + 1; i <= rows.length; i++) {
        for (const col of columns) {
          const fromCellId = `${col}${i}`;
          const toCellId = `${col}${i - 1}`;

          // Get data from the cell below
          const response = await axios.get('/api/cells', {
            params: {
              sheetId: activeSheet.id,
              cellId: fromCellId
            }
          });

          if (response.data.success) {
            // Move data to the cell above
            await axios.post('/api/cells', {
              sheetId: activeSheet.id,
              cellId: toCellId,
              value: response.data.data.value,
              formula: response.data.data.formula,
              style: response.data.data.style
            });

            // Clear the cell below
            await axios.delete('/api/cells', {
              params: {
                sheetId: activeSheet.id,
                cellId: fromCellId
              }
            });
          }
        }
      }

      setSelection(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to delete row:', error);
    }
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
  const getCellStyles = (style: CellStyle = {}): React.CSSProperties => ({
    fontWeight: style.bold ? 'bold' : 'normal',
    fontStyle: style.italic ? 'italic' : 'normal',
    textDecoration: style.underline ? 'underline' : 'none',
    textAlign: style.align || 'left',
    backgroundColor: style.backgroundColor || 'white',
    color: style.textColor || 'black',
    width: '100px',
    height: '25px',
  });

  // Column Headers Component
  const ColumnHeaders = () => (
    <div className="flex">
      {columns.map(col => (
        <div
          key={col}
          className="w-[100px] h-[25px] bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center"
          onContextMenu={(e) => handleHeaderContextMenu(e, col)}
        >
          {col}
        </div>
      ))}
    </div>
  );

  // Row Headers Component
  const RowHeaders = () => (
    <div className="flex flex-col">
      {rows.map(row => (
        <div
          key={row}
          className="w-[40px] h-[25px] bg-gray-100 border-r border-b border-gray-300 flex items-center justify-center"
          onContextMenu={(e) => handleRowContextMenu(e, row)}
        >
          {row}
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex">
        <div className="w-[40px] h-[25px] bg-gray-100 border-r border-b border-gray-300" />
        <ColumnHeaders />
      </div>
      <div className="flex flex-1 overflow-auto">
        <RowHeaders />
        <div className="flex-1">
          <div className="grid">
            {rows.map(row => (
              <div key={row} className="flex">
                {columns.map(col => {
                  const cellId = `${col}${row}`;
                  const isSelected = selection && 
                    cellId >= selection.start && 
                    cellId <= selection.end;

                  return (
                    <Cell
                      key={cellId}
                      cellId={cellId}
                      isActive={activeCell === cellId}
                      isDragging={isDragging}
                      style={getCellStyles()}
                      onMouseEnter={() => handleMouseEnter(cellId)}
                      onClick={() => handleMouseDown(cellId)}
                      onDoubleClick={() => setActiveCell(cellId)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
