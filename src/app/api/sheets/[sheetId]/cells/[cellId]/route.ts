import { NextRequest, NextResponse } from 'next/server';
import { CellController } from '@/server/controllers/cell.controller';
import { Application } from '@/server/models/application';

const cellController = CellController.instance;
const app = Application.instance;

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
    const updates = await req.json();
    const sheetId = parseInt(params.sheetId);
    
    if (isNaN(sheetId)) {
      console.error('Invalid sheet ID:', params.sheetId);
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400 });
    }

    const workbook = app.getWorkbook();
    const sheet = workbook.getSheet(sheetId);
    
    if (!sheet) {
      const sheets = workbook.getSheets();
      console.error(`Sheet not found: ${sheetId}. Available sheets:`, 
        sheets.map(s => ({ id: s.getId(), name: s.getName() }))
      );
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    // Update the cell
    sheet.setCell(params.cellId, {
      ...updates,
      isModified: true,
      lastModified: new Date().toISOString()
    });

    // Cache the updated sheet
    await cellController.setValue(sheetId, params.cellId, updates);

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