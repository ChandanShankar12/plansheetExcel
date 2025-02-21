import { NextRequest, NextResponse } from 'next/server';
import { Workbook } from '@/server/models/workbook';
import { SheetController } from '@/server/controllers/sheet.controller';
import { CellController } from '@/server/controllers/cell.controller';
import { CacheService } from '@/server/services/cache.service';
import { Application } from '@/server/models/application';

const sheetController = SheetController.getInstance();
const cellController = CellController.getInstance();
const cacheService = CacheService.getInstance();
const app = Application.getInstance();

interface CellData {
  value?: any;
  formula?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const workbook = Workbook.getInstance();
    
    // Try cache first
    const cachedSheet = await cacheService.get(
      cacheService.generateSheetKey(workbook.getId(), sheetId)
    );

    if (cachedSheet) {
      return NextResponse.json({
        success: true,
        data: cachedSheet
      });
    }

    // Fallback to workbook
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    const sheetData = sheet.toJSON();
    
    // Cache for future requests
    await cacheService.setWithExpiry(
      cacheService.generateSheetKey(workbook.getId(), sheetId),
      sheetData
    );

    return NextResponse.json({
      success: true,
      data: sheetData
    });
  } catch (error) {
    console.error('Sheet retrieval error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch sheet' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const workbook = app.getWorkbook();
    
    // Check if sheet exists
    const sheet = workbook.getSheet(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    // Remove sheet
    workbook.removeSheet(sheetId);
    
    // Clear sheet cache
    await cacheService.deleteSheet(workbook.getId(), sheetId);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Failed to delete sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete sheet' 
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const { name } = await req.json();
    
    const workbook = app.getWorkbook();
    const sheet = workbook.getSheet(sheetId);

    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    // Update sheet name
    sheet.setName(name);
    
    // Update cache
    await cacheService.setSheet(
      workbook.getId(),
      sheetId,
      sheet.toJSON()
    );

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('Failed to update sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update sheet' 
    }, { status: 500 });
  }
} 