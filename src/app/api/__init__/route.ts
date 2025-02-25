import { NextResponse } from 'next/server';
import { initializeApplication, getApplicationState } from '@/server/controllers/application.controller';
import { getSheets, getWorkbookState } from '@/server/controllers/workbook.controller';

export async function GET() {
  console.log('[API] Init endpoint called');
  try {
    console.log('[API] Initializing application');
    await initializeApplication();
    
    const sheets = getSheets();
    const workbookData = getWorkbookState();

    console.log('[API] Initialization complete:', {
      sheetsCount: sheets.length,
      firstSheetId: sheets[0]?.getId()
    });

    return NextResponse.json({
      success: true,
      data: {
        workbook: workbookData,
        sheets: sheets.map(s => s.toJSON())
      }
    });
  } catch (error) {
    console.error('[API] Init failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to initialize application' 
    }, { status: 500 });
  }
}