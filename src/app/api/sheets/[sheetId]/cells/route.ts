import { NextRequest, NextResponse } from 'next/server';
import { SheetController } from '@/server/controllers/sheet.controller';
import { CellController } from '@/server/controllers/cell.controller';

const sheetController = SheetController.getInstance();
const cellController = CellController.getInstance();

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const sheet = await sheetController.getSheet(sheetId);
    
    if (!sheet) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: sheet.getCellsData()
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
    const updates = await req.json();
    const sheetId = parseInt(params.sheetId);
    
    if (isNaN(sheetId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid sheet ID'
      }, { status: 400 });
    }
    
    const sheet = await sheetController.getSheet(sheetId);
    
    if (!sheet) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }

    for (const { id, data } of updates) {
      await cellController.updateCell(sheetId, id, data);
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
