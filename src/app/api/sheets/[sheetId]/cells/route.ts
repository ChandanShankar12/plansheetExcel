import { NextRequest, NextResponse } from 'next/server';
import { getSheetById } from '@/server/controllers/sheet.controller';
import { getAllCells, updateMultipleCells } from '@/server/controllers/cell.controller';
import { getSheetCellsFromCache } from '@/server/controllers/sheet.controller';
import { initializeApplication } from '@/server/controllers/application.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  console.log('[API/Cells] GET all cells request received:', params);
  try {
    // Initialize the application
    await initializeApplication();
    
    const sheetId = parseInt(params.sheetId);
    
    if (isNaN(sheetId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid sheet ID'
      }, { status: 400 });
    }
    
    try {
      // First check if the sheet exists
      const sheet = await getSheetById(sheetId);
      if (!sheet) {
        return NextResponse.json({
          success: false,
          error: 'Sheet not found'
        }, { status: 404 });
      }
      
      // Try to get cells from cache first
      let cells;
      try {
        cells = await getSheetCellsFromCache(sheetId);
        console.log(`[API/Cells] Retrieved ${Object.keys(cells).length} cells from cache for sheet ${sheetId}`);
      } catch (error) {
        console.warn(`[API/Cells] Failed to get cells from cache, falling back to sheet:`, error);
        cells = await getAllCells(sheetId);
      }
      
      return NextResponse.json({
        success: true,
        data: cells
      });
    } catch (error) {
      console.error('[API/Cells] Error getting cells:', error);
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('[API/Cells] Failed to get cells:', error);
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
  console.log('[API/Cells] POST bulk update request received:', params);
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
    
    try {
      // Check if sheet exists
      const sheet = await getSheetById(sheetId);
      if (!sheet) {
        return NextResponse.json({
          success: false,
          error: 'Sheet not found'
        }, { status: 404 });
      }
      
      // Format updates into the expected structure
      const cellUpdates: Record<string, any> = {};
      for (const { id, data } of updates) {
        cellUpdates[id] = data;
      }
      
      // Update multiple cells at once
      const result = await updateMultipleCells(sheetId, cellUpdates);
      
      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[API/Cells] Error updating cells:', error);
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update cells'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('[API/Cells] Failed to update cells:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update cells'
    }, { status: 500 });
  }
}
