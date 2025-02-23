import { CellData } from '@/lib/types';

export class Sheet {
  private readonly id: number;
  private name: string;
  private cells: Map<string, CellData>;
  private history: Map<string, CellData[]>;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.cells = new Map();
    this.history = new Map();
  }

  getId(): number {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name.trim();
  }

  getCell(id: string): CellData {
    const cell = this.cells.get(id);
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
    this.cells.set(id, newData);
  }

  clearCell(id: string): void {
    const existing = this.getCell(id);
    if (existing.value || existing.formula) {
      // Save to history before clearing
      const cellHistory = this.history.get(id) || [];
      cellHistory.push({ ...existing });
      this.history.set(id, cellHistory.slice(-10));
    }
    this.cells.delete(id);
  }

  clearCells(): void {
    this.cells.clear();
    this.history.clear();
  }

  getCellHistory(id: string): CellData[] {
    return this.history.get(id) || [];
  }

  getNonEmptyCellIds(): string[] {
    return Array.from(this.cells.entries())
      .filter(([_, cell]) => cell.value !== undefined && cell.value !== '')
      .map(([id]) => id);
  }

  getModifiedCells(): Array<{ id: string; data: CellData }> {
    return Array.from(this.cells.entries())
      .filter(([_, cell]) => cell.isModified)
      .map(([id, data]) => ({ id, data }));
  }

  getCellsData(): Record<string, CellData> {
    return Object.fromEntries(this.cells);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
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