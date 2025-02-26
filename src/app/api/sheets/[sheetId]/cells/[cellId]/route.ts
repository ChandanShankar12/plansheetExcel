import { NextRequest, NextResponse } from 'next/server';
import { getCell, updateCell, deleteCell } from '@/server/controllers/cell.controller';
import { getSheetById } from '@/server/controllers/sheet.controller';

// GET: Get a specific cell's value
export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] GET request received:', params);
  try {
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    
    // First check if the sheet exists
    const sheet = await getSheetById(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }
    
    const cell = await getCell(sheetId, cellId);
    
    if (!cell) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cell not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: cell 
    });
  } catch (error) {
    console.error('[API/Cells] GET failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get cell'
    }, { status: 500 });
  }
}

// POST: Update a cell's value
export async function POST(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] POST request received:', params);
  try {
    const updates = await req.json();
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    
    if (isNaN(sheetId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400 });
    }

    // First check if the sheet exists
    const sheet = await getSheetById(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    // Update the cell using our controller
    const updatedCell = updateCell(sheetId, cellId, updates);

    return NextResponse.json({
      success: true,
      data: updatedCell
    });
  } catch (error) {
    console.error('[API/Cells] POST failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update cell'
    }, { status: 500 });
  }
}

// DELETE: Clear cell data
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] DELETE request received:', params);
  try {
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    
    // First check if the sheet exists
    const sheet = await getSheetById(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }
    
    const result = deleteCell(sheetId, cellId);
    
    return NextResponse.json({ 
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[API/Cells] DELETE failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete cell'
    }, { status: 500 });
  }
}

// PATCH: Update a cell's value
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] PATCH request received:', params);
  try {
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    const updates = await req.json();
    
    // First check if the sheet exists
    const sheet = await getSheetById(sheetId);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }
    
    const updatedCell = updateCell(sheetId, cellId, updates);
    
    return NextResponse.json({ 
      success: true, 
      data: updatedCell 
    });
  } catch (error) {
    console.error('[API/Cells] PATCH failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update cell'
    }, { status: 500 });
  }
} 