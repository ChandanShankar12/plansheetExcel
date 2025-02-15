import { NextResponse } from 'next/server';
import { Application } from '@/server/models/application';
import { ApplicationController } from '@/server/controllers/application-controller';

export async function POST(request: Request) {
  try {
    // Validate request body
    const body = await request.json();
    if (!body.application) {
      return NextResponse.json(
        { error: 'Missing application data' },
        { status: 400 }
      );
    }

    const app = Application.fromJSON(body.application);
    
    // Get formatted data with cells from cache
    try {
      const dtstData = await ApplicationController.saveWorkbook(app);
      
      // Create file content
      const content = JSON.stringify(dtstData, null, 2);
      const blob = new Blob([content], { 
        type: 'application/json'
      });

      return new NextResponse(blob, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="workbook.dtst"',
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      console.error('Error creating file:', error);
      return NextResponse.json(
        { error: 'Failed to create file' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in save route:', error);
    return NextResponse.json(
      { error: 'Failed to process save request' },
      { status: 500 }
    );
  }
} 