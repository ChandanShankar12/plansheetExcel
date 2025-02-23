import { WorkbookController } from '@/server/controllers/workbook.controller';

const workbookController = WorkbookController.instance;

export async function GET() {
  try {
    const workbook = workbookController.getWorkbook();
    return Response.json({
      success: true,
      data: workbook.toJSON()
    });
  } catch (error) {
    console.error('Failed to get workbook:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get workbook' 
    }, { status: 500 });
  }
}
