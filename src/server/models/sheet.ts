import { CellData } from '@/lib/types';

export class Sheet {
  private _id: number;
  private _name: string;
  private _cells: Map<string, CellData>;
  private _history: Map<string, CellData[]>;

  constructor(id: number, name?: string) {
    this._id = id;
    this._name = (name || `Sheet ${id}`).trim();
    this._cells = new Map();
    this._history = new Map();
    console.log('[Sheet] Created new sheet:', { id: this._id, name: this._name });
  }

  getId(): number {
    return this._id;
  }

  getName(): string {
    return this._name;
  }

  setName(name: string): void {
    this._name = name.trim();
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
      const cellHistory = this._history.get(id) || [];
      cellHistory.push({ ...existing });
      this._history.set(id, cellHistory.slice(-10));
    }
    this._cells.delete(id);
  }

  clearCells(): void {
    this._cells.clear();
    this._history.clear();
  }

  getCellHistory(id: string): CellData[] {
    return this._history.get(id) || [];
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
      parseInt(data.id) || 1,
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