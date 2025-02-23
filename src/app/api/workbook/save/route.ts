import { WorkbookController } from '@/server/controllers/workbook.controller';

const workbookController = WorkbookController.instance;

export async function POST(request: Request) {
  try {
    // Save workbook without additional data
    await workbookController.saveWorkbook();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to save workbook:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to save workbook' 
    }, { status: 500 });
  }
} 