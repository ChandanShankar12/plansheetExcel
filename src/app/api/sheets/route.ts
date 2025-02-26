import { NextRequest, NextResponse } from 'next/server';
import { createSheet, getAllSheets } from '@/server/controllers/sheet.controller';
import { initializeApplication } from '@/server/controllers/application.controller';

// Interface for cell updates
interface CellData {
  value?: any;
  formula?: string;
}

// Interface for sheet updates
interface SheetUpdates {
  name?: string;
  cells?: Record<string, CellData>;
}

// Interface for request bodies
interface PostRequestBody {
  name: string;  // Required for POST
}

interface PatchRequestBody {
  sheets?: Record<string, SheetUpdates>;
}

// POST: Create a new sheet
export async function POST(req: NextRequest) {
  console.log('[API/Sheets] POST request received');
  try {
    // Initialize application first
    await initializeApplication();
    
    const body = await req.json();
    const name = body.name || `Sheet ${Date.now()}`;
    
    console.log('[API/Sheets] Creating sheet with name:', name);
    const sheet = await createSheet(name);
    
    console.log('[API/Sheets] Sheet created successfully:', sheet.getId());
    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
    });
  } catch (error) {
    console.error('[API/Sheets] POST failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create sheet'
    }, { status: 500 });
  }
}

// GET: List all sheets
export async function GET() {
  console.log('[API/Sheets] GET request received');
  try {
    // Initialize application first
    await initializeApplication();
    
    const sheets = getAllSheets();
    return NextResponse.json({
      success: true,
      data: sheets.map(sheet => sheet.toJSON())
    });
  } catch (error) {
    console.error('[API/Sheets] GET failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to get sheets'
    }, { status: 500 });
  }
}

