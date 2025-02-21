import { NextRequest, NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { CellData } from '@/lib/types';

const app = Application.getInstance();

// GET: Get a specific cell's value
export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
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

    const cellData = sheet.getCell(params.cellId);

    return NextResponse.json({
      success: true,
      data: cellData
    });
  } catch (error) {
    console.error('Failed to get cell:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cell'
    }, { status: 500 });
  }
}

// PATCH: Update a cell's value
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
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

    const updates: Partial<CellData> = await req.json();
    sheet.setCell(params.cellId, updates);

    return NextResponse.json({
      success: true,
      data: sheet.getCell(params.cellId)
    });
  } catch (error) {
    console.error('Failed to update cell:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update cell'
    }, { status: 500 });
  }
}

// DELETE: Clear cell data
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const { cellId } = params;

    const workbook = app.getWorkbook();
    const sheet = workbook.getSheet(sheetId);

    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    await sheet.clearCell(cellId);

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Cell deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to clear cell' 
    }, { status: 500 });
  }
} 