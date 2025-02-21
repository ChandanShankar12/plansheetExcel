import { NextRequest, NextResponse } from 'next/server';
import { Workbook } from '@/server/models/workbook';
import { CellController } from '@/server/controllers/cell.controller';
import { CacheService } from '@/server/services/cache.service';
import { Application } from '@/server/models/application';
import { redis } from '@/server/db/cache/redis_client';
import { CellData } from '@/lib/types';

const cellController = CellController.getInstance();
const cacheService = CacheService.getInstance();
const app = Application.getInstance();

interface CellUpdate {
  value?: any;
  formula?: string;
}

// GET: Get all cells for a sheet
export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const workbook = app.getWorkbook();
    const sheet = workbook.getSheet(sheetId);

    if (!sheet) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }

    // Get all cells data
    const cells = sheet.getCellsData();

    return NextResponse.json({
      success: true,
      data: cells
    });
  } catch (error) {
    console.error('Failed to get cells:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cells'
    }, { status: 500 });
  }
}

// POST: Bulk update multiple cells
export async function POST(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const body = await req.json() as Record<string, CellUpdate>;
    
    const workbook = Workbook.getInstance();
    const sheet = workbook.getSheet(sheetId);

    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    const updates = Object.entries(body).map(async ([cellId, update]) => {
      if (update.formula) {
        await cellController.setFormula(sheetId, cellId, update.formula);
      }
      if (update.value !== undefined) {
        await cellController.setValue(sheetId, cellId, update.value);
      }
    });

    await Promise.all(updates);

    // Cache the updated sheet
    await cacheService.setSheet(workbook.getId(), sheetId, sheet.toJSON());

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('Cells update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update cells' 
    }, { status: 500 });
  }
} 