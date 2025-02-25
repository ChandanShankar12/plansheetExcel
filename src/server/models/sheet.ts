import { SheetData } from '@/lib/types';
import { Cell, CellData, CellStyle } from './cell';

export class Sheet {
  private _id: number;
  private _name: string;
  private _cells: Map<string, Cell>;
  private _isModified: boolean;
  private _lastModified: string;

  constructor(name: string, id?: number) {
    this._id = id || 0;
    this._name = name;
    this._cells = new Map<string, Cell>();
    this._isModified = false;
    this._lastModified = new Date().toISOString();
  }

  // Get sheet ID
  getId(): number {
    return this._id;
  }

  // Get sheet name
  getName(): string {
    return this._name;
  }

  // Set sheet name
  setName(name: string): void {
    this._name = name;
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  // Get all cells
  getCells(): Map<string, Cell> {
    return this._cells;
  }

  // Get a specific cell
  getCell(id: string): Cell | null {
    return this._cells.get(id) || null;
  }

  // Set a cell
  setCell(id: string, cell: Cell): void {
    this._cells.set(id, cell);
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  // Update a cell with partial data
  updateCell(id: string, updates: Partial<CellData>): void {
    const currentCell = this._cells.get(id);
    if (currentCell) {
      // Update existing cell using its updateProperties method
      currentCell.updateProperties(updates);
    } else {
      // Create a new cell if it doesn't exist
      // Parse the cell ID to extract row and column (assuming format like "A1", "B2", etc.)
      const column = id.match(/[A-Z]+/)?.[0] || 'A';
      const row = parseInt(id.match(/\d+/)?.[0] || '1', 10);
      
      const newCell = new Cell(this._id, row, column);
      if (updates.value !== undefined) newCell.setValue(updates.value);
      if (updates.formula !== undefined) newCell.setFormula(updates.formula);
      if (updates.style !== undefined) newCell.style = { ...newCell.style, ...updates.style };
      
      this._cells.set(id, newCell);
    }
    
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  // Delete a cell
  deleteCell(id: string): boolean {
    const result = this._cells.delete(id);
    if (result) {
      this._isModified = true;
      this._lastModified = new Date().toISOString();
    }
    return result;
  }

  // Check if sheet is modified
  isModified(): boolean {
    return this._isModified;
  }

  // Get last modified timestamp
  getLastModified(): string {
    return this._lastModified;
  }

  // Get cells as an object for API responses
  getCellsData(): Record<string, CellData> {
    const cellsData: Record<string, CellData> = {};
    this._cells.forEach((cell, id) => {
      cellsData[id] = cell.toCellData();
    });
    return cellsData;
  }

  // Convert to JSON
  toJSON(): SheetData {
    return {
      id: this._id,
      name: this._name,
      cells: this.getCellsData(),
    };
  }

  // Create from JSON
  static fromJSON(data: SheetData): Sheet {
    const sheet = new Sheet(data.name, data.id);
    
    if (data.cells) {
      Object.entries(data.cells).forEach(([id, cellData]) => {
        // Parse the cell ID to extract row and column
        const column = id.match(/[A-Z]+/)?.[0] || 'A';
        const row = parseInt(id.match(/\d+/)?.[0] || '1', 10);
        
        const cell = new Cell(sheet.getId(), row, column);
        cell.updateProperties(cellData);
        sheet.setCell(id, cell);
      });
    }
    
    return sheet;
  }
} 