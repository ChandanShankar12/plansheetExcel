import { CellData } from '@/lib/types';

export class Sheet {
  private readonly _id: string;
  private _name: string;
  private _cells: Map<string, CellData>;
  private history: Map<string, CellData[]>;

  constructor(sequence: number, name: string) {
    this._id = `${Date.now()}-${sequence}`;
    this._name = name.trim();
    this._cells = new Map();
    this.history = new Map();
    console.log('[Sheet] Created new sheet:', { id: this._id, name: this._name });
  }

  getId(): string {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  getCell(id: string): CellData {
    const cell = this._cells.get(id);
    if (!cell) {
      return {
        value: '',
        formula: '',
        style: {},
        isModified: false,
        lastModified: new Date().toISOString()
      };
    }
    return cell;
  }

  setCell(id: string, data: Partial<CellData>): void {
    const existing = this.getCell(id);
    const newData: CellData = {
      ...existing,
      ...data,
      lastModified: new Date().toISOString(),
      isModified: true
    };
    this._cells.set(id, newData);
  }

  clearCell(id: string): void {
    const existing = this.getCell(id);
    if (existing.value || existing.formula) {
      // Save to history before clearing
      const cellHistory = this.history.get(id) || [];
      cellHistory.push({ ...existing });
      this.history.set(id, cellHistory.slice(-10));
    }
    this._cells.delete(id);
  }

  clearCells(): void {
    this._cells.clear();
    this.history.clear();
  }

  getCellHistory(id: string): CellData[] {
    return this.history.get(id) || [];
  }

  getNonEmptyCellIds(): string[] {
    return Array.from(this._cells.entries())
      .filter(([_, cell]) => cell.value !== undefined && cell.value !== '')
      .map(([id]) => id);
  }

  getModifiedCells(): Array<{ id: string; data: CellData }> {
    return Array.from(this._cells.entries())
      .filter(([_, cell]) => cell.isModified)
      .map(([id, data]) => ({ id, data }));
  }

  getCellsData(): Record<string, CellData> {
    return Object.fromEntries(this._cells);
  }

  toJSON() {
    return {
      id: this._id,
      name: this._name,
      cells: this.getCellsData()
    };
  }

  static fromJSON(data: any): Sheet {
    const sheet = new Sheet(
      parseInt(data.id) || 0,
      data.name || 'Untitled Sheet'
    );
    
    if (data.cells) {
      Object.entries(data.cells).forEach(([id, cellData]) => {
        sheet.setCell(id, cellData as CellData);
      });
    }
    
    return sheet;
  }
} 