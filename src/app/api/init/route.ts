import { NextResponse } from 'next/server';
import { initializeApplication, getApplicationState } from '@/server/controllers/application.controller';
import { getSheets, getWorkbookState, getWorkbook } from '@/server/controllers/workbook.controller';
import { initializeCache, cacheWorkbook, cacheSheet, cacheCellData } from '@/server/services/cache.service';

export async function GET() {
  console.log('[API] Init endpoint called');
  try {
    // Initialize cache service first
    console.log('[API] Initializing cache service');
    await initializeCache();
    
    // Initialize application (which will try to restore from cache)
    console.log('[API] Initializing application');
    await initializeApplication();
    
    const sheets = await getSheets();
    const workbook = await getWorkbook();
    const workbookData = await getWorkbookState();
    const appState = getApplicationState();

    // Ensure all sheets have the correct workbook ID
    sheets.forEach(sheet => {
      if (!sheet.getWorkbookId() || sheet.getWorkbookId() !== workbook.getId()) {
        console.log(`[API] Setting workbook ID ${workbook.getId()} for sheet ${sheet.getId()}`);
        sheet.setWorkbookId(workbook.getId());
      }
    });

    // Cache each sheet individually first, including all cells
    console.log('[API] Caching individual sheets during initialization');
    for (const sheet of sheets) {
      const sheetData = sheet.toJSON();
      
      // First cache each cell individually
      if (sheetData.cells) {
        const cellIds = Object.keys(sheetData.cells);
        console.log(`[API] Sheet ${sheet.getId()} has ${cellIds.length} cells to cache`);
        
        for (const cellId of cellIds) {
          const cellData = sheetData.cells[cellId];
          if (cellData) {
            await cacheCellData(sheet.getId(), cellId, cellData);
            console.log(`[API] Cached cell ${cellId} for sheet ${sheet.getId()}`);
          }
        }
      } else {
        console.log(`[API] Sheet ${sheet.getId()} has no cells to cache`);
      }
      
      // Then cache the sheet itself
      await cacheSheet(sheet.getId(), sheetData);
      console.log(`[API] Cached sheet ${sheet.getId()} during initialization`);
    }

    // Re-cache the workbook to ensure it's up to date
    await cacheWorkbook(workbookData);
    console.log('[API] Cached workbook after all sheets');

    console.log('[API] Initialization complete:', {
      sheetsCount: sheets.length,
      sheetIds: sheets.map(s => s.getId()),
      workbookId: workbook.getId(),
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