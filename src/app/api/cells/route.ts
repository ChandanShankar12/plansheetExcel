import { NextResponse } from 'next/server';
import { updateCellValue } from '@/lib/db/services/cell-service';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, columnKey, rowIndex, value, formula } = await request.json();
    
    await updateCellValue(spreadsheetId, columnKey, rowIndex, value, formula);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update cell:', error);
    return NextResponse.json(
      { error: 'Failed to update cell' },
      { status: 500 }
    );
  }
} 