import { CellData, SheetData } from '@/lib/types';

export class Sheet {
  private _id: number;
  private _name: string;
  private _cells: Map<string, CellData>;
  private _isModified: boolean;
  private _lastModified: string;
  private _workbookId: number | null;
  constructor(name: string, id?: number, workbookId?: number) {
    this._id = id || Date.now();
    this._name = name;
    this._cells = new Map<string, CellData>();
    this._isModified = false;
    this._lastModified = new Date().toISOString();
    this._workbookId = workbookId || null;
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
      // Ensure style is properly merged with defaults
      const style = {
        bold: (updates.style?.bold !== undefined) ? updates.style.bold : (currentCell.style?.bold || false),
        italic: (updates.style?.italic !== undefined) ? updates.style.italic : (currentCell.style?.italic || false),
        underline: (updates.style?.underline !== undefined) ? updates.style.underline : (currentCell.style?.underline || false),
        color: (updates.style?.color !== undefined) ? updates.style.color : (currentCell.style?.color || null),
        backgroundColor: (updates.style?.backgroundColor !== undefined) ? updates.style.backgroundColor : (currentCell.style?.backgroundColor || null),
        fontSize: (updates.style?.fontSize !== undefined) ? updates.style.fontSize : (currentCell.style?.fontSize || 12),
        fontFamily: (updates.style?.fontFamily !== undefined) ? updates.style.fontFamily : (currentCell.style?.fontFamily || 'Arial'),
        alignment: (updates.style?.alignment !== undefined) ? updates.style.alignment : (currentCell.style?.alignment || 'left')
      };
      
      this._cells.set(id, {
        ...currentCell,
        ...updates,
        style, // Use the complete style object
        isModified: true,
        lastModified: new Date().toISOString()
      });
    } else {
      // Create a new cell if it doesn't exist with complete style
      const style = {
        bold: updates.style?.bold || false,
        italic: updates.style?.italic || false,
        underline: updates.style?.underline || false,
        color: updates.style?.color || null,
        backgroundColor: updates.style?.backgroundColor || null,
        fontSize: updates.style?.fontSize || 12,
        fontFamily: updates.style?.fontFamily || 'Arial',
        alignment: updates.style?.alignment || 'left'
      };
      
      this._cells.set(id, {
        value: updates.value || '',
        formula: updates.formula || '',
        style,
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

  // Get workbook ID
  getWorkbookId(): number | null {
    return this._workbookId;
  }

  // Set workbook ID
  setWorkbookId(workbookId: number): void {
    this._workbookId = workbookId;
    this._isModified = true;
    this._lastModified = new Date().toISOString();
  }

  // Convert to JSON
  toJSON(includeFullCellData: boolean = true): SheetData {
    console.log(`[Sheet] Converting sheet ${this._id} to JSON with includeFullCellData=${includeFullCellData}`);
    
    const cellsData = Object.fromEntries(this._cells);
    const cellIds = Object.keys(cellsData);
    
    console.log(`[Sheet] Sheet ${this._id} has ${cellIds.length} cell IDs`);
    
    const sheetData: SheetData = {
      id: this._id,
      name: this._name,
      cells: includeFullCellData ? cellsData : {},
      cellIds: cellIds,
    };
    
    // Only include workbookId if it exists
    if (this._workbookId !== null) {
      sheetData.workbookId = this._workbookId?.toString() || null;
    }
    
    return sheetData;
  }

  // Create from JSON
  static fromJSON(data: SheetData): Sheet {
    console.log(`[Sheet] Creating sheet from JSON: id=${data.id}, name=${data.name}`);
    
    const sheet = new Sheet(data.name, data.id);
    
    // Set cells from data
    if (data.cells && Object.keys(data.cells).length > 0) {
      console.log(`[Sheet] Setting ${Object.keys(data.cells).length} cells from JSON data`);
      
      Object.entries(data.cells).forEach(([id, cellData]) => {
        sheet.setCell(id, cellData);
      });
    } else if (data.cellIds && data.cellIds.length > 0) {
      // If we have cellIds but no cells, log this for debugging
      console.log(`[Sheet] Sheet has ${data.cellIds.length} cell IDs but no cell data`);
    }
    
    // Set workbook ID if available
    if (data.workbookId) {
      sheet.setWorkbookId(parseInt(data.workbookId.toString(), 10));
    }
    
    return sheet;
  }
} 