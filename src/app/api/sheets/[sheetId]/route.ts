import { NextRequest, NextResponse } from 'next/server';
import { SheetController } from '@/server/controllers/sheet.controller';

const sheetController = SheetController.instance;

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

    const sheet = await sheetController.getSheet(sheetId);
    
    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('Failed to get sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get sheet' 
    }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    await sheetController.deleteSheet(params.sheetId);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Failed to delete sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete sheet' 
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const updates = await req.json();
    const sheet = await sheetController.updateSheet(params.sheetId, updates);

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('Failed to update sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update sheet' 
    }, { status: 500 });
  }
} 