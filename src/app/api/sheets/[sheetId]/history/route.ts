import { NextRequest, NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { CacheService } from '@/server/services/cache.service';

const app = Application.getInstance();
const cacheService = CacheService.getInstance();

export async function GET(
  req: NextRequest,
  { params }: { params: { sheetId: string } }
) {
  try {
    const sheetId = parseInt(params.sheetId);
    const workbook = app.getWorkbook();
    const sheet = workbook.getSheet(sheetId);

    if (!sheet) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sheet not found' 
      }, { status: 404 });
    }

    // Get modified cells history
    const modifiedCells = Array.from(sheet.getCellsData())
      .filter(([_, cell]) => cell.isModified)
      .map(([id, cell]) => ({
        id,
        value: cell.value,
        lastModified: cell.lastModified
      }))
      .sort((a, b) => 
        new Date(b.lastModified!).getTime() - new Date(a.lastModified!).getTime()
      );

    return NextResponse.json({
      success: true,
      data: modifiedCells
    });
  } catch (error) {
    console.error('Failed to get sheet history:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get sheet history' 
    }, { status: 500 });
  }
} 