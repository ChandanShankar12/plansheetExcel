import { NextResponse } from 'next/server';
import { saveWorkbookData } from '@/lib/db/services/cell-service';
import type { NewSheet } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const cells: NewSheet[] = await request.json();
    
    if (!cells || !Array.isArray(cells) || cells.length === 0) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    console.log('Received save request:', {
      cellCount: cells.length,
      sheetId: cells[0].sheetId,
      userId: cells[0].userId
    });

    const result = await saveWorkbookData(cells);
    
    if (!result) {
      throw new Error('Failed to save workbook');
    }
    
    console.log('Successfully saved workbook');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save workbook:', error);
    return NextResponse.json(
      { error: 'Failed to save workbook' }, 
      { status: 500 }
    );
  }
} 