'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';
import { useState, useRef, useEffect } from 'react';
import { ContextMenu } from './context-menu';
import { updateCellValue } from '@/lib/db/services/cell-service';
import { storage } from '@/lib/db/services/json-storage';

interface Selection {
  start: string;
  end: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  type: 'row' | 'column' | null;
  index?: number | string;
}

interface CellStyle {
  fontFamily?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  textColor?: string;
  backgroundColor?: string;
  align?: string;
}

interface CellData {
  value: string;
  formula?: string;
  style?: CellStyle;
  metadata?: Record<string, any>;
}

interface SpreadsheetData {
  [key: string]: CellData;
}

export function Grid() {
  const { 
    activeCell, 
    setActiveCell, 
    data, 
    updateCell, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    spreadsheetId,
    setData,
    activeSheetId,
    selection,
    setSelection
  } = useSpreadsheetContext();
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [savingCells, setSavingCells] = useState<Set<string>>(new Set());
  const [resizing, setResizing] = useState<{
    type: 'row' | 'column';
    index: number | string;
    startPos: number;
    startSize: number;
  } | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [rowHeights, setRowHeights] = useState<Record<number, number>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const columns = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  const rows = Array.from({ length: 100 }, (_, i) => i + 1);

  // Convert cell ID to coordinates
  const getCellCoords = (cellId: string) => {
    const col = cellId.match(/[A-Z]+/)?.[0] || '';
    const row = parseInt(cellId.match(/\d+/)?.[0] || '0');
    return { col, row };
  };

  // Check if cell is within selection
  const isCellSelected = (cellId: string) => {
    if (!selection) return false;
    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);
    const { col, row } = getCellCoords(cellId);

    const minCol = String.fromCharCode(Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const maxCol = String.fromCharCode(Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return col >= minCol && col <= maxCol && row >= minRow && row <= maxRow;
  };

  // Handle single cell click
  const handleCellClick = (cellId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isEditing) {
      setActiveCell(cellId);
      if (!isDragging) {
        setSelection({ start: cellId, end: cellId });
      }
    }
  };

  // Handle mouse down for drag selection
  const handleMouseDown = (cellId: string) => {
    if (!isEditing) {
      setIsDragging(true);
      setActiveCell(cellId);
      setSelection({ start: cellId, end: cellId });
    }
  };

  // Handle mouse enter for drag selection
  const handleMouseEnter = (cellId: string) => {
    if (isDragging && selection) {
      setSelection(prev => prev ? { ...prev, end: cellId } : null);
    }
  };

  // Handle mouse up to end drag selection
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add mouse up listener
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Handle double click to start editing
  const handleCellDoubleClick = (cellId: string) => {
    setActiveCell(cellId);
    setIsEditing(true);
    const cellKey = `${activeSheetId}_${cellId}`;
    setEditValue(data[cellKey]?.value || '');
  };

  // Handle cell value updates
  const handleCellUpdate = async (cellId: string, value: string) => {
    try {
      setSavingCells(prev => new Set(prev).add(cellId));
      
      // Update UI immediately
      const cellKey = `${activeSheetId}_${cellId}`;
      updateCell(cellKey, { value });
      
      // Update storage
      await storage.updateCell(spreadsheetId, activeSheetId, cellId, {
        value,
        formula: value.startsWith('=') ? value : undefined,
        style: data[cellKey]?.style || {},
        metadata: data[cellKey]?.metadata || {}
      });
    } catch (error) {
      console.error('Failed to update cell:', error);
    } finally {
      setSavingCells(prev => {
        const next = new Set(prev);
        next.delete(cellId);
        return next;
      });
    }
  };

  // Stop editing and save value
  const stopEditing = () => {
    if (activeCell) {
      const cellKey = `${activeSheetId}_${activeCell}`;
      if (editValue !== data[cellKey]?.value) {
        handleCellUpdate(activeCell, editValue);
      }
    }
    setIsEditing(false);
    setEditValue('');
  };

  // Update keyboard shortcuts to handle selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || isEditing) return;

      // Save (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const saveButton = document.querySelector('button[title="Save (Ctrl+S)"]');
        if (saveButton instanceof HTMLButtonElement) {
          saveButton.click();
        }
      }

      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selectedCells = selection ? getSelectedCellsData() : data[`${activeSheetId}_${activeCell}`]?.value || '';
        navigator.clipboard.writeText(selectedCells);
      }

      // Cut (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        const selectedCells = selection ? getSelectedCellsData() : data[`${activeSheetId}_${activeCell}`]?.value || '';
        navigator.clipboard.writeText(selectedCells);
        if (selection) {
          clearSelectedCells();
        } else {
          const cellKey = `${activeSheetId}_${activeCell}`;
          updateCell(cellKey, { value: '' });
        }
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        navigator.clipboard.readText().then(text => {
          if (selection) {
            pasteToSelection(text);
          } else {
            const cellKey = `${activeSheetId}_${activeCell}`;
            updateCell(cellKey, { value: text });
          }
        });
      }

      // Start editing on F2 or when typing any character
      if (e.key === 'F2' || (!isEditing && e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
        handleCellDoubleClick(activeCell);
      }

      // Finish editing on Enter
      if (e.key === 'Enter') {
        stopEditing();
      }

      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
      }

      // Redo (Ctrl/Cmd + Shift + Z) or (Ctrl/Cmd + Y)
      if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && e.key === 'z') || e.key === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeCell, data, isEditing, selection, updateCell, undo, redo, canUndo, canRedo, activeSheetId]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Helper functions for selection operations
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
        const cellKey = `${activeSheetId}_${cellId}`;
        result += (data[cellKey]?.value || '') + '\t';
      }
      result = result.trim() + '\n';
    }
    return result.trim();
  };

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
        const cellKey = `${activeSheetId}_${cellId}`;
        updateCell(cellKey, { value: '' });
      }
    }
  };

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
        const cellKey = `${activeSheetId}_${cellId}`;
        updateCell(cellKey, { value: cell });
      });
    });
  };

  // Helper function to get selection bounds
  const getSelectionBounds = (cellId: string) => {
    if (!selection) return { isTopEdge: false, isRightEdge: false, isBottomEdge: false, isLeftEdge: false };
    
    const { col: startCol, row: startRow } = getCellCoords(selection.start);
    const { col: endCol, row: endRow } = getCellCoords(selection.end);
    const { col, row } = getCellCoords(cellId);

    const minCol = String.fromCharCode(Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const maxCol = String.fromCharCode(Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return {
      isTopEdge: row === minRow,
      isRightEdge: col === maxCol,
      isBottomEdge: row === maxRow,
      isLeftEdge: col === minCol,
    };
  };

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
      index: col
    });
  };

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
      index: row
    });
  };

  const clearColumnContent = (col: string) => {
    const newData = { ...data };
    // Only clear the content, keep the column
    rows.forEach(row => {
      const cellId = `${col}${row}`;
      const cellKey = `${activeSheetId}_${cellId}`;
      if (newData[cellKey]) {
        newData[cellKey] = { ...newData[cellKey], value: '' };
      }
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  const clearRowContent = (row: number) => {
    const newData = { ...data };
    // Only clear the content, keep the row
    columns.forEach(col => {
      const cellId = `${col}${row}`;
      const cellKey = `${activeSheetId}_${cellId}`;
      if (newData[cellKey]) {
        newData[cellKey] = { ...newData[cellKey], value: '' };
      }
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  const deleteColumn = (col: string) => {
    const newData = { ...data };
    // Delete the column and shift remaining columns left
    rows.forEach(row => {
      let currentCol = col;
      while (currentCol < 'Z') {
        const nextCol = String.fromCharCode(currentCol.charCodeAt(0) + 1);
        const currentCellId = `${currentCol}${row}`;
        const nextCellId = `${nextCol}${row}`;
        const currentCellKey = `${activeSheetId}_${currentCellId}`;
        const nextCellKey = `${activeSheetId}_${nextCellId}`;
        newData[currentCellKey] = newData[nextCellKey] || { value: '' };
        currentCol = nextCol;
      }
      // Delete the last column
      const lastCellKey = `${activeSheetId}_${col}${row}`;
      delete newData[lastCellKey];
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  const deleteRow = (row: number) => {
    const newData = { ...data };
    // Delete the row and shift remaining rows up
    columns.forEach(col => {
      let currentRow = row;
      while (currentRow < rows.length) {
        const nextRow = currentRow + 1;
        const currentCellId = `${col}${currentRow}`;
        const nextCellId = `${col}${nextRow}`;
        const currentCellKey = `${activeSheetId}_${currentCellId}`;
        const nextCellKey = `${activeSheetId}_${nextCellId}`;
        newData[currentCellKey] = newData[nextCellKey] || { value: '' };
        currentRow = nextRow;
      }
      // Delete the last row
      const lastCellKey = `${activeSheetId}_${col}${rows.length}`;
      delete newData[lastCellKey];
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  // Handle resize start
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
      startSize: currentSize
    });
  };

  // Handle resize move
  useEffect(() => {
    if (!resizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (resizing.type === 'column') {
        const diff = e.clientX - resizing.startPos;
        const newWidth = Math.max(40, resizing.startSize + diff);
        setColumnWidths(prev => ({
          ...prev,
          [resizing.index]: newWidth
        }));
      } else {
        const diff = e.clientY - resizing.startPos;
        const newHeight = Math.max(20, resizing.startSize + diff);
        setRowHeights(prev => ({
          ...prev,
          [resizing.index as number]: newHeight
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

  // Add a function to get computed styles for a cell
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
    MozOsxFontSmoothing: 'grayscale'
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

        {/* Cells */}
        <div className="flex-1">
          {rows.map((row) => (
            <div key={row} className="flex h-[20px]">
              {columns.map((col) => {
                const cellId = `${col}${row}`;
                const cellKey = `${activeSheetId}_${cellId}`;
                const cellData = data[cellKey];
                const isActive = activeCell === cellId;
                const cellStyle = cellData?.style || {};
                const computedStyles = getCellStyles(cellStyle);
                
                return (
                  <div
                    key={cellId}
                    className={`
                      w-[80px] h-[20px] shrink-0 border-r border-b 
                      relative cursor-cell select-none
                      ${isActive ? 'ring-2 ring-[#166534] ring-inset' : ''}
                      hover:bg-gray-50
                    `}
                    style={computedStyles}
                    onClick={(e) => handleCellClick(cellId, e)}
                    onDoubleClick={() => handleCellDoubleClick(cellId)}
                    onMouseDown={() => handleMouseDown(cellId)}
                    onMouseEnter={() => handleMouseEnter(cellId)}
                  >
                    {isEditing && isActive ? (
                      <input
                        ref={inputRef}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={stopEditing}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            stopEditing();
                          } else if (e.key === 'Escape') {
                            setIsEditing(false);
                            setEditValue(data[cellKey]?.value || '');
                          }
                        }}
                        className="absolute inset-0 w-full h-full px-1 outline-none border-none bg-white"
                        style={{
                          ...computedStyles,
                          lineHeight: '20px', // Match cell height
                        }}
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="px-1 truncate h-full flex items-center"
                        style={computedStyles}
                      >
                        {cellData?.value ? evaluateFormula(cellData.value, data) : ''}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => {
            setContextMenu(null);
            setSelection(null);
          }}
          onClearContent={() => {
            if (contextMenu.type === 'column' && typeof contextMenu.index === 'string') {
              clearColumnContent(contextMenu.index);
            } else if (contextMenu.type === 'row' && typeof contextMenu.index === 'number') {
              clearRowContent(contextMenu.index);
            }
          }}
          onDelete={() => {
            if (contextMenu.type === 'column' && typeof contextMenu.index === 'string') {
              deleteColumn(contextMenu.index);
            } else if (contextMenu.type === 'row' && typeof contextMenu.index === 'number') {
              deleteRow(contextMenu.index);
            }
          }}
          type={contextMenu.type}
          index={contextMenu.index}
        />
      )}

      {/* Resize overlay */}
      {resizing && (
        <div className="fixed inset-0 z-50 cursor-col-resize" />
      )}
    </div>
  );
}