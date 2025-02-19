import { Cell } from '../models/cell';
import { CellStyle } from '@/lib/types';
import { SheetService } from './sheet.service';

export class CellService {
  private static instance: CellService;
  private cells: Map<string, Cell> = new Map();
  private sheetService: SheetService | null = null; // Initialize as null

  private constructor() {
    // Don't initialize sheetService here
  }

  static getInstance(): CellService {
    if (!CellService.instance) {
      CellService.instance = new CellService();
    }
    return CellService.instance;
  }

  // Lazy initialize sheetService when needed
  private getSheetService(): SheetService {
    if (!this.sheetService) {
      this.sheetService = SheetService.getInstance();
    }
    return this.sheetService;
  }

  createCell(sheetId: number, row: number, column: string): Cell {
    const cell = new Cell(sheetId, row, column);
    this.cells.set(cell.id, cell);
    return cell;
  }

  getCell(id: string): Cell | undefined {
    return this.cells.get(id);
  }

  getCellByReference(sheetId: number, cellRef: string): Cell {
    const existingCell = Array.from(this.cells.values()).find(
      cell => cell.getSheetId() === sheetId && cell.getCellReference() === cellRef
    );

    if (existingCell) {
      return existingCell;
    }

    const [col, row] = cellRef.match(/([A-Z]+)(\d+)/)?.slice(1) || [];
    return this.createCell(sheetId, parseInt(row), col);
  }

  updateCell(cellId: string, value: any, formula?: string): boolean {
    const cell = this.getCell(cellId);
    if (!cell) return false;

    try {
      if (formula) {
        cell.setFormula(formula);
      } else {
        cell.setValue(value);
      }
      return true;
    } catch (error) {
      console.error('Error updating cell:', error);
      return false;
    }
  }

  updateCellStyle(id: string, style: Partial<CellStyle>): boolean {
    const cell = this.getCell(id);
    if (!cell) return false;

    try {
      Object.assign(cell.style, style);
      return true;
    } catch (error) {
      console.error('Error updating cell style:', error);
      return false;
    }
  }

  private validateCellDependencies(cell: Cell): void {
    // Check for circular dependencies
    const dependencies = this.extractCellReferences(cell.getFormula());
    const visited = new Set<string>();
    
    for (const dep of dependencies) {
      if (this.hasCircularDependency(cell, dep, visited)) {
        throw new Error('Circular dependency detected');
      }
    }
  }

  private extractCellReferences(formula: string): string[] {
    if (!formula) return [];
    const cellRefPattern = /[A-Z]+[0-9]+/g;
    return formula.match(cellRefPattern) || [];
  }

  private hasCircularDependency(
    originalCell: Cell,
    currentRef: string,
    visited: Set<string>
  ): boolean {
    if (visited.has(currentRef)) return true;
    visited.add(currentRef);

    const currentCell = this.getCellByReference(originalCell.getSheetId(), currentRef);
    const dependencies = this.extractCellReferences(currentCell.getFormula());

    for (const dep of dependencies) {
      if (this.hasCircularDependency(originalCell, dep, visited)) {
        return true;
      }
    }

    visited.delete(currentRef);
    return false;
  }

  saveCell(cell: Cell): void {
    this.cells.set(cell.id, cell);
  }

  deleteCell(id: string): boolean {
    return this.cells.delete(id);
  }

  evaluateFormula(cell: Cell): any {
    if (!cell.getFormula()) return cell.getValue();

    try {
      const formula = cell.getFormula();
      const references = this.extractCellReferences(formula);
      let evaluatedFormula = formula;

      for (const ref of references) {
        const referencedCell = this.getCellByReference(cell.getSheetId(), ref);
        const value = this.evaluateFormula(referencedCell);
        evaluatedFormula = evaluatedFormula.replace(ref, value?.toString() || '0');
      }

      // Remove the '=' at the start if it exists
      if (evaluatedFormula.startsWith('=')) {
        evaluatedFormula = evaluatedFormula.substring(1);
      }

      // Safe evaluation of the formula
      // Note: In a real application, you'd want to use a proper formula parser
      return eval(evaluatedFormula);
    } catch (error) {
      console.error('Error evaluating formula:', error);
      return cell.getFormula();
    }
  }
} 