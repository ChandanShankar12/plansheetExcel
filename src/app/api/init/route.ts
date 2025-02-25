import { NextResponse } from 'next/server';
import { ApplicationController } from '@/server/controllers/application.controller';

export async function GET() {
  console.log('[API] Init endpoint called');
  try {
    console.log('[API] Getting application controller');
    const appController = ApplicationController.getInstance();
    
    console.log('[API] Initializing application');
    await appController.initialize();
    
    const workbookController = appController.getWorkbookController();
    const sheets = workbookController.getSheets();

    console.log('[API] Initialization complete:', {
      sheetsCount: sheets.length,
      firstSheetId: sheets[0]?.getId()
    });

    return NextResponse.json({
      success: true,
      data: {
        workbook: workbookController.toJSON(),
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