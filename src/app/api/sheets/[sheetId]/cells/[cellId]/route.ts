import { NextRequest, NextResponse } from 'next/server';
import { updateCell, getCell, deleteCell } from '@/server/controllers/cell.controller';
import { initializeApplication } from '@/server/controllers/application.controller';

// GET: Get a specific cell's value
export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] GET request received:', params);
  try {
    // Initialize the application
    await initializeApplication();
    
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    
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
    // Initialize the application
    await initializeApplication();
    
    const updates = await req.json();
    const sheetId = parseInt(params.sheetId);
    
    if (isNaN(sheetId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400 });
    }

    // Update the cell using the controller
    const updatedCell = await updateCell(sheetId, params.cellId, updates);
    
    if (!updatedCell) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update cell' 
      }, { status: 500 });
    }

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
    // Initialize the application
    await initializeApplication();
    
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    
    const result = await deleteCell(sheetId, cellId);
    
    return NextResponse.json({ 
      success: result.success 
    });
  } catch (error) {
    console.error('[API/Cells] DELETE failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete cell'
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sheetId: string; cellId: string } }
) {
  console.log('[API/Cells] PATCH request received:', params);
  try {
    // Initialize the application
    await initializeApplication();
    
    const sheetId = parseInt(params.sheetId);
    const cellId = params.cellId;
    const updates = await req.json();
    
    // Update the cell
    const updatedCell = await updateCell(sheetId, cellId, updates);
    
    if (!updatedCell) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update cell' 
      }, { status: 500 });
    }
    
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