import { NextRequest, NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { CacheService } from '@/server/services/cache.service';

const cacheService = CacheService.getInstance();
const app = Application.getInstance();

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

/**
 * POST endpoint to create a new sheet
 */
export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    const workbook = app.getWorkbook();
    
    if (workbook.getSheets().some(s => s.getName() === name)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet with this name already exists' 
      }, { status: 400 });
    }

    const newSheet = workbook.addSheet(name);
    
    await cacheService.setSheet(
      workbook.getId(),
      newSheet.getId(),
      newSheet.toJSON()
    );

    return NextResponse.json({
      success: true,
      data: newSheet.toJSON()
    });
  } catch (error) {
    console.error('Failed to create sheet:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create sheet' 
    }, { status: 500 });
  }
}

// GET: List all sheets
export async function GET() {
  try {
    const workbook = app.getWorkbook();
    const sheets = workbook.getSheets().map(sheet => sheet.toJSON());
    
    return NextResponse.json({
      success: true,
      data: sheets
    });
  } catch (error) {
    console.error('Failed to get sheets:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get sheets' 
    }, { status: 500 });
  }
}

