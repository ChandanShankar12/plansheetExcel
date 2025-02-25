import { NextRequest, NextResponse } from 'next/server';
import { getSheetById } from '@/server/controllers/sheet.controller';
import { getAllCells, updateMultipleCells } from '@/server/controllers/cell.controller';

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    
    if (isNaN(sheetId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid sheet ID'
      }, { status: 400 });
    }
    
    try {
      const cells = getAllCells(sheetId);
      
      return NextResponse.json({
        success: true,
        data: cells
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }
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
    
    try {
      // Check if sheet exists
      getSheetById(sheetId);
      
      // Format updates into the expected structure
      const cellUpdates: Record<string, any> = {};
      for (const { id, data } of updates) {
        cellUpdates[id] = data;
      }
      
      // Update multiple cells at once
      const result = updateMultipleCells(sheetId, cellUpdates);
      
      return NextResponse.json({
        success: true,
        data: result
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Sheet not found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Failed to update cells:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update cells'
    }, { status: 500 });
  }
}
