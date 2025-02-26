import { NextResponse } from 'next/server';
import { getWorkbookState, getSheet, getSheets } from '@/server/controllers/workbook.controller';
import { cacheWorkbook, cacheSheet, cacheCellData, cacheApplicationState, getSheetCellIds } from '@/server/services/cache.service';
import { initializeApplication, getApplicationState } from '@/server/controllers/application.controller';

export async function POST(request: Request) {
  try {
    console.log('[API/Workbook/Save] Saving workbook');
    
    // Initialize application first
    await initializeApplication();
    
    // Get current workbook state with full cell data
    const workbookData = await getWorkbookState(true);
    
    console.log('[API/Workbook/Save] Workbook data:', {
      id: workbookData.id,
      name: workbookData.name,
      nextSheetId: workbookData.nextSheetId,
      sheetsCount: workbookData.sheets?.length || 0,
      sheetIds: workbookData.sheets?.map(s => s.id) || []
    });
    
    // Get all sheets to ensure we have the latest data
    const sheets = await getSheets();
    
    // Cache each sheet individually first
    if (workbookData.sheets && workbookData.sheets.length > 0) {
      console.log('[API/Workbook/Save] Caching individual sheets');
      
      for (const sheetData of workbookData.sheets) {
        // First get existing cell IDs from cache to preserve them
        const existingCellIds = await getSheetCellIds(sheetData.id);
        
        // Get the corresponding sheet object to ensure we have all cell data
        const sheet = sheets.find(s => s.getId() === sheetData.id);
        if (sheet) {
          const fullSheetData = sheet.toJSON(true);
          
          // Combine existing cell IDs with current ones
          const currentCellIds = Object.keys(fullSheetData.cells || {});
          const allCellIds = [...new Set([...existingCellIds, ...currentCellIds])];
          
          console.log(`[API/Workbook/Save] Sheet ${sheetData.id} has ${allCellIds.length} total cell IDs (${existingCellIds.length} existing, ${currentCellIds.length} current)`);
          
          // Make sure cellIds is populated with all IDs
          sheetData.cellIds = allCellIds;
          
          // Cache each cell individually to ensure they're preserved
          if (fullSheetData.cells) {
            for (const cellId of currentCellIds) {
              const cellData = fullSheetData.cells[cellId];
              if (cellData) {
                await cacheCellData(sheetData.id, cellId, cellData);
                console.log(`[API/Workbook/Save] Cached cell ${cellId} for sheet ${sheetData.id}`);
              }
            }
          }
        } else {
          // If we can't find the sheet object, use what we have
          if (sheetData.cells) {
            const cellIds = Object.keys(sheetData.cells);
            console.log(`[API/Workbook/Save] Sheet ${sheetData.id} has ${cellIds.length} cells to cache`);
            
            // Make sure cellIds is populated
            sheetData.cellIds = [...new Set([...existingCellIds, ...cellIds])];
            
            for (const cellId of cellIds) {
              const cellData = sheetData.cells[cellId];
              if (cellData) {
                await cacheCellData(sheetData.id, cellId, cellData);
                console.log(`[API/Workbook/Save] Cached cell ${cellId} for sheet ${sheetData.id}`);
              }
            }
          } else {
            console.log(`[API/Workbook/Save] Sheet ${sheetData.id} has no cells to cache`);
            // Ensure cellIds is at least the existing array
            sheetData.cellIds = existingCellIds;
          }
        }
        
        // Then cache the sheet (which will store the cell IDs but not the full cell data)
        await cacheSheet(sheetData.id, sheetData);
        console.log(`[API/Workbook/Save] Cached sheet: ${sheetData.id} with ${sheetData.cellIds.length} cell IDs`);
      }
    }
     
    // Create a version of workbook data with only cell IDs for caching
    const workbookDataForCache = {
      ...workbookData,
      // Remove nextSheetId as it's only needed in backend
      nextSheetId: undefined,
      sheets: await Promise.all(workbookData.sheets.map(async (sheet) => {
        // Create a copy of the sheet data
        const sheetCopy = { ...sheet };
        
        // Get the existing cell IDs from the sheet cache
        const existingCellIds = await getSheetCellIds(sheetCopy.id);
        
        // Combine existing cell IDs with current ones
        const currentCellIds = Object.keys(sheetCopy.cells || {});
        const allCellIds = [...new Set([...existingCellIds, ...currentCellIds])];
        
        console.log(`[API/Workbook/Save] Sheet ${sheetCopy.id} has ${allCellIds.length} total cell IDs for workbook cache`);
        
        // Ensure cellIds is populated with all IDs
        sheetCopy.cellIds = allCellIds;
        
        // Replace cells with empty object to save space
        sheetCopy.cells = {};
        
        // Remove workbookId as it's redundant in the workbook cache
        sheetCopy.workbookId = undefined;
        
        return sheetCopy;
      }))
    };
    
    // Cache the workbook state AFTER caching all sheets
    // This ensures the workbook has references to all sheets
    await cacheWorkbook(workbookDataForCache);
    console.log('[API/Workbook/Save] Cached workbook after all sheets');
    
    // Update the application data with the latest workbook information
    const appData = getApplicationState();
    
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
    console.log('[API/Workbook/Save] Updated appData with simplified workbook information');
    
    console.log('[API/Workbook/Save] Workbook saved successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Workbook saved successfully'
    });
  } catch (error) {
    console.error('[API/Workbook/Save] Failed to save workbook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save workbook' 
    }, { status: 500 });
  }
} 