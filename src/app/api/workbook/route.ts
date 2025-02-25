import { getWorkbookState } from '@/server/controllers/workbook.controller';

export async function GET() {
  try {
    const workbookData = getWorkbookState();
    return Response.json({
      success: true,
      data: workbookData
    });
  } catch (error) {
    console.error('Failed to get workbook:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to get workbook' 
    }, { status: 500 });
  }
}
