import { NextRequest, NextResponse } from 'next/server';
import { SheetController } from '@/server/controllers/sheet.controller';
import { Application } from '@/server/models/application';

const sheetController = SheetController.instance;
const app = Application.instance;

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
  try {
    const { name } = await req.json();
    const sheet = await sheetController.createSheet(name);
    console.log('Sheet created:', sheet.getId());

    return NextResponse.json({
      success: true,
      data: sheet.toJSON()
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
    const sheets = await sheetController.getAllSheets();
    return NextResponse.json({
      success: true,
      data: sheets.map(sheet => sheet.toJSON())
    });
  } catch (error) {
    console.error('Failed to get sheets:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to get sheets' 
    }, { status: 500 });
  }
}

