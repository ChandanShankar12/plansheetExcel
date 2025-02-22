import { NextRequest, NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { CellController } from '@/server/controllers/cell.controller';
import { CacheService } from '@/server/services/cache.service';
import { CellData } from '@/lib/types';

const app = Application.instance;
const cellController = CellController.instance;
const cacheService = CacheService.instance;

interface CellUpdate {
  id: string;
  data: CellData;
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

export async function POST(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const updates = await req.json() as CellUpdate[];
    const sheetId = parseInt(params.sheetId);
    const sheet = app.getWorkbook().getSheet(sheetId);
    
    if (!sheet) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }

    // Process all cell updates
    for (const update of updates) {
      await cellController.setValue(sheetId, update.id, update.data);
    }

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('Failed to update cells:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update cells'
    }, { status: 500 });
  }
}
