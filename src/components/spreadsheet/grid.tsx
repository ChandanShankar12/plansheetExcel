'use client';

import { useSpreadsheetContext } from '@/context/spreadsheet-context';
import { evaluateFormula } from '@/lib/spreadsheet';
import { useState, useRef, useEffect } from 'react';
import { ContextMenu } from './context-menu';

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

export function Grid() {
  const { 
    activeCell, 
    setActiveCell, 
    data, 
    updateCell, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useSpreadsheetContext();
  const [editValue, setEditValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

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

  // Handle mouse selection
  const handleMouseDown = (cellId: string) => {
    if (!isEditing) {
      setIsSelecting(true);
      setSelection({ start: cellId, end: cellId });
      setActiveCell(cellId);
    }
  };

  const handleMouseEnter = (cellId: string) => {
    if (isSelecting && selection) {
      setSelection(prev => prev ? { ...prev, end: cellId } : null);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // Handle cell editing
  const startEditing = (cellId: string) => {
    setIsEditing(true);
    setEditValue(data[cellId]?.value || '');
    setActiveCell(cellId);
  };

  const stopEditing = () => {
    if (activeCell && editValue !== data[activeCell]?.value) {
      updateCell(activeCell, { value: editValue });
    }
    setIsEditing(false);
  };

  // Update keyboard shortcuts to handle selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCell || isEditing) return;

      // Copy (Ctrl/Cmd + C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const selectedCells = selection ? getSelectedCellsData() : data[activeCell]?.value || '';
        navigator.clipboard.writeText(selectedCells);
      }

      // Cut (Ctrl/Cmd + X)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        const selectedCells = selection ? getSelectedCellsData() : data[activeCell]?.value || '';
        navigator.clipboard.writeText(selectedCells);
        if (selection) {
          clearSelectedCells();
        } else {
          updateCell(activeCell, { value: '' });
        }
      }

      // Paste (Ctrl/Cmd + V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        navigator.clipboard.readText().then(text => {
          if (selection) {
            pasteToSelection(text);
          } else {
            updateCell(activeCell, { value: text });
          }
        });
      }

      // Start editing on F2 or when typing any character
      if (e.key === 'F2' || (!isEditing && e.key.length === 1 && !e.ctrlKey && !e.metaKey)) {
        startEditing(activeCell);
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
  }, [activeCell, data, isEditing, selection, updateCell, undo, redo, canUndo, canRedo]);

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
        result += (data[cellId]?.value || '') + '\t';
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
        updateCell(cellId, { value: '' });
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
        updateCell(cellId, { value: cell });
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
      if (newData[cellId]) {
        newData[cellId] = { ...newData[cellId], value: '' };
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
      if (newData[cellId]) {
        newData[cellId] = { ...newData[cellId], value: '' };
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
        newData[currentCellId] = newData[nextCellId] || { value: '' };
        currentCol = nextCol;
      }
      // Delete the last column
      delete newData[`Z${row}`];
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
        newData[currentCellId] = newData[nextCellId] || { value: '' };
        currentRow = nextRow;
      }
      // Delete the last row
      delete newData[`${col}${rows.length}`];
    });
    setData(newData);
    setSelection(null);
    setContextMenu(null);
  };

  return (
    <div 
      className="relative w-full"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header row */}
      <div className="sticky top-0 z-10 flex bg-white">
        <div className="sticky left-0 z-20 w-[35px] shrink-0 bg-white border-r border-b" />
        {columns.map((col) => (
          <div 
            key={col} 
            className={`
              w-[80px] shrink-0 border-r border-b p-1 text-center text-xs 
              hover:bg-gray-50 cursor-pointer
              ${selection?.start.startsWith(col) ? 'bg-[#e6f0eb]' : ''}
            `}
            onContextMenu={(e) => handleHeaderContextMenu(e, col)}
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleHeaderContextMenu(e, col);
              }
            }}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Grid content */}
      <div className="flex">
        {/* Row numbers */}
        <div className="sticky left-0 z-10 bg-white">
          {rows.map((row) => (
            <div 
              key={row} 
              className={`
                w-[35px] h-[20px] shrink-0 border-r border-b 
                flex items-center justify-center text-xs 
                hover:bg-gray-50 cursor-pointer
                ${selection?.start.endsWith(row.toString()) ? 'bg-[#e6f0eb]' : ''}
              `}
              onContextMenu={(e) => handleRowContextMenu(e, row)}
              onClick={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  handleRowContextMenu(e, row);
                }
              }}
            >
              {row}
            </div>
          ))}
        </div>

        {/* Cells */}
        <div className="flex-1">
          {rows.map((row) => (
            <div key={row} className="flex">
              {columns.map((col) => {
                const cellId = `${col}${row}`;
                const cellData = data[cellId];
                const displayValue = cellData?.value ? evaluateFormula(cellData.value, data) : '';
                const isActive = activeCell === cellId;
                const isInSelection = isCellSelected(cellId);
                const { isTopEdge, isRightEdge, isBottomEdge, isLeftEdge } = getSelectionBounds(cellId);
                
                return (
                  <div
                    key={cellId}
                    className={`
                      w-[80px] h-[20px] shrink-0 border-r border-b 
                      relative cursor-cell select-none
                      ${isActive && !isInSelection ? 'ring-2 ring-[#166534] ring-inset' : ''}
                      ${isInSelection ? 'bg-[#e6f0eb]' : ''}
                      ${isInSelection && isTopEdge ? 'border-t-2 border-t-[#166534] -mt-[1px]' : ''}
                      ${isInSelection && isRightEdge ? 'border-r-2 border-r-[#166534] -mr-[1px]' : ''}
                      ${isInSelection && isBottomEdge ? 'border-b-2 border-b-[#166534] -mb-[1px]' : ''}
                      ${isInSelection && isLeftEdge ? 'border-l-2 border-l-[#166534] -ml-[1px]' : ''}
                    `}
                    onMouseDown={() => handleMouseDown(cellId)}
                    onMouseEnter={() => handleMouseEnter(cellId)}
                    onDoubleClick={() => startEditing(cellId)}
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
                          }
                        }}
                        className="absolute inset-0 w-full h-full px-1 text-xs outline-none"
                      />
                    ) : (
                      <div className="px-1 text-xs truncate">{displayValue}</div>
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
    </div>
  );
} 