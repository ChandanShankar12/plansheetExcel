import { NextResponse } from 'next/server';
import { initializeApplication, getApplicationState } from '@/server/controllers/application.controller';
import { getSheets, getWorkbookState } from '@/server/controllers/workbook.controller';
import { initializeCache } from '@/server/services/cache.service';

export async function GET() {
  console.log('[API] Init endpoint called');
  try {
    // Initialize cache service first
    console.log('[API] Initializing cache service');
    await initializeCache();
    
    // Initialize application (which will try to restore from cache)
    console.log('[API] Initializing application');
    await initializeApplication();
    
    const sheets = getSheets();
    const workbookData = getWorkbookState();
    const appState = getApplicationState();

    console.log('[API] Initialization complete:', {
      sheetsCount: sheets.length,
      firstSheetId: sheets[0]?.getId(),
      appVersion: appState.version,
      companyId: appState.companyId
    });

    return NextResponse.json({
      success: true,
      data: {
        application: appState,
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