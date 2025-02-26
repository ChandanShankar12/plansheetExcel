import { NextResponse } from 'next/server';
import { getWorkbookState } from '@/server/controllers/workbook.controller';
import { cacheWorkbook, cacheSheet, cacheCellData } from '@/server/services/cache.service';
import { initializeApplication } from '@/server/controllers/application.controller';

export async function POST(request: Request) {
  try {
    console.log('[API/Workbook/Save] Saving workbook');
    
    // Initialize application first
    await initializeApplication();
    
    // Get current workbook state
    const workbookData = await getWorkbookState();
    
    console.log('[API/Workbook/Save] Workbook data:', {
      id: workbookData.id,
      name: workbookData.name,
      nextSheetId: workbookData.nextSheetId,
      sheetsCount: workbookData.sheets?.length || 0,
      sheetIds: workbookData.sheets?.map(s => s.id) || []
    });
    
    // Cache each sheet individually first
    if (workbookData.sheets && workbookData.sheets.length > 0) {
      console.log('[API/Workbook/Save] Caching individual sheets');
      
      for (const sheetData of workbookData.sheets) {
        // First cache each cell individually to ensure they're preserved
        if (sheetData.cells) {
          const cellIds = Object.keys(sheetData.cells);
          console.log(`[API/Workbook/Save] Sheet ${sheetData.id} has ${cellIds.length} cells to cache`);
          
          for (const cellId of cellIds) {
            const cellData = sheetData.cells[cellId];
            if (cellData) {
              await cacheCellData(sheetData.id, cellId, cellData);
              console.log(`[API/Workbook/Save] Cached cell ${cellId} for sheet ${sheetData.id}`);
            }
          }
        } else {
          console.log(`[API/Workbook/Save] Sheet ${sheetData.id} has no cells to cache`);
        }
        
        // Then cache the sheet (which will store the cell IDs but not the full cell data)
        await cacheSheet(sheetData.id, sheetData);
        console.log(`[API/Workbook/Save] Cached sheet: ${sheetData.id}`);
      }
    }
    
    // Cache the workbook state AFTER caching all sheets
    // This ensures the workbook has references to all sheets
    await cacheWorkbook(workbookData);
    console.log('[API/Workbook/Save] Cached workbook after all sheets');
    
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