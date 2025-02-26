import { NextResponse } from 'next/server';
import { getWorkbookState, cacheWorkbook } from '@/server/controllers/workbook.controller';

export async function POST(request: Request) {
  try {
    // Get current workbook state
    const workbookData = getWorkbookState();
    
    // Cache the workbook state
    await cacheWorkbook(workbookData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Workbook saved successfully'
    });
  } catch (error) {
    console.error('Failed to save workbook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save workbook' 
    }, { status: 500 });
  }
} 