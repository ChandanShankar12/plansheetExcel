import { NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { ApplicationController } from '@/server/controllers/application-controller';

export async function POST(request: Request) {
  try {
    const { application } = await request.json();
    if (!application) {
      return NextResponse.json({ error: 'Missing application data' }, { status: 400 });
    }

    const app = Application.fromJSON(application);
    const dtstData = await ApplicationController.saveWorkbook(app);

    return new NextResponse(JSON.stringify(dtstData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="workbook.dtst"',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save workbook' }, { status: 500 });
  }
} 