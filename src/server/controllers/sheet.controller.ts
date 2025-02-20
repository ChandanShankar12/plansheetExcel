import { SheetService } from '../services/sheet.service';

export class SheetController {
  private static instance: SheetController | null = null;
  private sheetService: SheetService;

  private constructor() {
    this.sheetService = SheetService.getInstance();
  }

  static getInstance(): SheetController {
    if (!SheetController.instance) {
      SheetController.instance = new SheetController();
    }
    return SheetController.instance;
  }

  async getSheet(sheetId: number) {
    try {
      return this.sheetService.getSheet(sheetId);
    } catch (error) {
      throw new Error('Failed to get sheet');
    }
  }

  async getAllCells(sheetId: number) {
    try {
      return this.sheetService.getAllCells(sheetId);
    } catch (error) {
      throw new Error('Failed to get cells');
    }
  }

  async getCellValue(sheetId: number, cellId: string) {
    try {
      return this.sheetService.getCellValue(sheetId, cellId);
    } catch (error) {
      throw new Error('Failed to get cell value');
    }
  }

  async setCellValue(sheetId: number, cellId: string, value: any) {
    try {
      return this.sheetService.setCellValue(sheetId, cellId, value);
    } catch (error) {
      throw new Error('Failed to set cell value');
    }
  }

  async getModifiedCells(sheetId: number) {
    try {
      return this.sheetService.getModifiedCells(sheetId);
    } catch (error) {
      throw new Error('Failed to get modified cells');
    }
  }

  async clearModifiedCells(sheetId: number) {
    try {
      return this.sheetService.clearModifiedCells(sheetId);
    } catch (error) {
      throw new Error('Failed to clear modified cells');
    }
  }

  async setName(sheetId: number, name: string) {
    try {
      return this.sheetService.setName(sheetId, name);
    } catch (error) {
      throw new Error('Failed to set sheet name');
    }
  }
} 