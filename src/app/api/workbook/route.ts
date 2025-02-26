import { getWorkbookState } from '@/server/controllers/workbook.controller';
import { initializeApplication } from '@/server/controllers/application.controller';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Initialize application first
    await initializeApplication();
    
    // Get workbook state with await
    const workbookData = await getWorkbookState();
    
    return NextResponse.json({
      success: true,
      data: workbookData
    });
  } catch (error) {
    console.error('Failed to get workbook:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get workbook' 
    }, { status: 500 });
  }
}
