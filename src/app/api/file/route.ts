// Import required dependencies
import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';
import { Application } from '@/server/models/application';
import { FileHandler } from '@/server/services/file/file-handler';

// POST endpoint for uploading and processing files
export async function POST(request: Request) {
  try {
    // Extract file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read and parse file contents
    const content = await file.text();
    const data = JSON.parse(content);
    
    // Create new application instance from the parsed file data
    // This reconstructs the full application state including workbooks
    const app = Application.fromJSON(data.body.application);
    
    // Save the application state to Redis cache for persistence
    await FileHandler.saveToCache(app);

    // Return success response with the serialized application state
    return NextResponse.json({ 
      success: true, 
      application: app.toJSON() 
    });

  } catch (error) {
    // Log and return error if file processing fails
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving application state
export async function GET(request: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Handle request for new application
    if (type === 'new') {
      // Create fresh application instance with initial structure
      const app = new Application();
      const workbook = app.createWorkbook();
      const sheet = workbook.getSpreadsheet().addSheet('Sheet 1');
      
      // Save new application to Redis cache
      await FileHandler.saveToCache(app);

      // Return the new application state
      return NextResponse.json({ 
        success: true, 
        application: app.toJSON() 
      });
    }

    // For existing applications, attempt to load from Redis cache
    const cachedData = await FileHandler.loadFromCache();
    
    // Return cached data if found
    if (cachedData) {
      return NextResponse.json({
        success: true,
        application: cachedData,
        source: 'cache'
      });
    }

    // Return 404 if no cached data exists
    return NextResponse.json({
      success: false,
      error: 'No data found'
    }, { status: 404 });

  } catch (error) {
    // Log and return error if retrieval fails
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
} 