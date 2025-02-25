import { CellData, SheetData } from '@/lib/types';

export class Sheet {
  private _id: number;
  private _name: string;
  private _cells: Map<string, CellData>;
  private _isModified: boolean;
  private _lastModified: string;

  constructor(name: string, id?: number) {
    this._id = id || Date.now();
    this._name = name;
    this._cells = new Map<string, CellData>();
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
  getCells(): Map<string, CellData> {
    return this._cells;
  }

  // Get a specific cell
  getCell(id: string): CellData | null {
    return this._cells.get(id) || null;
  }

  // Set a cell
  setCell(id: string, data: CellData): void {
    this._cells.set(id, data);
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  // Update a cell with partial data
  updateCell(id: string, updates: Partial<CellData>): void {
    const currentCell = this._cells.get(id);
    if (currentCell) {
      this._cells.set(id, {
        ...currentCell,
        ...updates,
        isModified: true,
        lastModified: new Date().toISOString()
      });
    } else {
      // Create a new cell if it doesn't exist
      this._cells.set(id, {
        value: updates.value || '',
        formula: updates.formula || '',
        style: updates.style || {},
        isModified: true,
        lastModified: new Date().toISOString()
      });
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
    return Object.fromEntries(this._cells);
  }

  // Convert to JSON
  toJSON(): SheetData {
    return {
      id: this._id,
      name: this._name,
      cells: Object.fromEntries(this._cells),
      isModified: this._isModified,
      lastModified: this._lastModified
    };
  }

  // Create from JSON
  static fromJSON(data: SheetData): Sheet {
    const sheet = new Sheet(data.name, data.id);
    
    if (data.cells) {
      Object.entries(data.cells).forEach(([id, cellData]) => {
        sheet.setCell(id, cellData);
      });
    }
    
    return sheet;
  }
} 