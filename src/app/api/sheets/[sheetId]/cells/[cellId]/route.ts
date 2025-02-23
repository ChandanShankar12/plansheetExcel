import { NextRequest, NextResponse } from 'next/server';
import { CellController } from '@/server/controllers/cell.controller';


const cellController = CellController.instance;

// GET: Get a specific cell's value
export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const value = await cellController.getValue(sheetId, params.cellId);

    return NextResponse.json({
      success: true,
      data: value
    });
  } catch (error) {
    console.error('Failed to get cell:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get cell'
    }, { status: 500 });
  }
}

// POST: Update a cell's value
export async function POST(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  try {
    const { value, formula, style } = await req.json();
    const sheetId = parseInt(params.sheetId);
    
    try {
    if (isNaN(sheetId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400, });
    }

    if (isNaN(parseInt(params.cellId))) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid cell ID' 
      }, { status: 400 });
    }} catch (error) {
      console.error('Failed to update cell:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to update cell'
      }, { status: 500 });
    }
    
    // Use cellController directly
    await cellController.setValue(sheetId, params.cellId, {
      value,
      formula,
      style,
      isModified: true,
      lastModified: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: await cellController.getValue(sheetId, params.cellId)
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
    await cellController.clearCell(sheetId, params.cellId);

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