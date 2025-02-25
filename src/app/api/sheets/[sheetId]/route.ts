import { NextRequest, NextResponse } from 'next/server';
import { SheetController } from '@/server/controllers/sheet.controller';

const sheetController = SheetController.getInstance();

export async function GET(
  request: Request,
  { params }: { params: { sheetId: string } }
) {
  console.log('[API/Sheets] GET request:', params);
  try {
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

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('[API/Sheets] GET failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get sheet' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { sheetId: string } }
) {
  console.log('[API/Sheets] DELETE request:', params);
  try {
    const sheetId = parseInt(params.sheetId);
    if (isNaN(sheetId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400 });
    }

    await sheetController.deleteSheet(sheetId);

    return NextResponse.json({
      success: true,
      data: null
    });
  } catch (error) {
    console.error('[API/Sheets] DELETE failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete sheet' 
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  console.log('[API/Sheets] PATCH request:', params);
  try {
    const sheetId = parseInt(params.sheetId);
    if (isNaN(sheetId)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid sheet ID' 
      }, { status: 400 });
    }

    const data = await request.json();
    
    // Validate request body
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request body is required' 
      }, { status: 400 });
    }

    const sheet = await sheetController.updateSheet(sheetId, data);
    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('[API/Sheets] PATCH failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update sheet' 
    }, { status: 500 });
  }
} 