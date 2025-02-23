import { NextRequest, NextResponse } from 'next/server';
import { SheetController } from '@/server/controllers/sheet.controller';
import { CellController } from '@/server/controllers/cell.controller';

const sheetController = SheetController.instance;
const cellController = CellController.instance;

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const sheet = await sheetController.getSheet(sheetId);
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
    const sheet = await sheetController.getSheet(sheetId);

    for (const { id, data } of updates) {
      await cellController.setValue(sheetId, id, data);
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
