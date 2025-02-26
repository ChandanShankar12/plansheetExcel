import { NextResponse } from 'next/server';
import { initializeApplication, getApplicationState } from '@/server/controllers/application.controller';
import { getSheets, getWorkbookState, getWorkbook } from '@/server/controllers/workbook.controller';
import { initializeCache, cacheWorkbook, cacheSheet, cacheCellData, cacheApplicationState, getSheetCellIds } from '@/server/services/cache.service';

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
    // Get workbook state with full cell data
    const workbookData = await getWorkbookState(true);
    const appData = getApplicationState();

    console.log('[API] Application state loaded:', {
      version: appData.version,
      companyId: appData.companyId,
      hasWorkbook: !!appData.workbook,
      workbookId: appData.workbook?.id || workbook.getId()
    });

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
      // Get existing cell IDs from cache to preserve them
      const existingCellIds = await getSheetCellIds(sheet.getId());
      const sheetData = sheet.toJSON(true);
      
      // Combine existing cell IDs with current ones
      const currentCellIds = Object.keys(sheetData.cells || {});
      const allCellIds = [...new Set([...existingCellIds, ...currentCellIds])];
      
      console.log(`[API] Sheet ${sheet.getId()} has ${allCellIds.length} total cell IDs (${existingCellIds.length} existing, ${currentCellIds.length} current)`);
      
      // Make sure cellIds is populated with all IDs
      sheetData.cellIds = allCellIds;
      
      // First cache each cell individually
      if (sheetData.cells) {
        console.log(`[API] Sheet ${sheet.getId()} has ${Object.keys(sheetData.cells).length} cells to cache`);
        
        for (const cellId of Object.keys(sheetData.cells)) {
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
      console.log(`[API] Cached sheet ${sheet.getId()} with ${sheetData.cellIds.length} cell IDs`);
    }

    // Create a modified workbook data with only cell IDs for the cache
    const workbookDataForCache = {
      ...workbookData,
      sheets: workbookData.sheets.map((sheetData: any) => {
        // Create a copy of the sheet data
        const sheetCopy = { ...sheetData };
        
        // Ensure cellIds is populated
        if (!sheetCopy.cellIds || !sheetCopy.cellIds.length) {
          if (sheetCopy.cells) {
            sheetCopy.cellIds = Object.keys(sheetCopy.cells);
          } else {
            sheetCopy.cellIds = [];
          }
        }
        
        // Replace cells with empty object to save space
        sheetCopy.cells = {};
        
        return sheetCopy;
      })
    };

    // Re-cache the workbook to ensure it's up to date
    await cacheWorkbook(workbookDataForCache);
    console.log('[API] Cached workbook after all sheets');
    
    // Update the application data with the latest workbook information
    // Simplify the app data to only include essential information
    const simplifiedAppData = {
      version: appData.version,
      companyId: appData.companyId,
      workbook: {
        id: workbookDataForCache.id,
        name: workbookDataForCache.name,
        config: workbookDataForCache.config || {
          theme: 'light',
          autoSave: false
        }
      },
      timestamp: new Date().toISOString()
    };
    
    await cacheApplicationState(simplifiedAppData);
    console.log('[API] Updated appData with simplified workbook information');

    console.log('[API] Initialization complete:', {
      sheetsCount: sheets.length,
      sheetIds: sheets.map(s => s.getId()),
      workbookId: workbook.getId(),
      appVersion: appData.version,
      companyId: appData.companyId
    });

    // Return the response with the full workbook data
    return NextResponse.json({
      success: true,
      data: {
        application: appData,
        workbook: workbookData,
        sheets: sheets.map(s => s.toJSON(true)) // Always include full cell data in the response
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