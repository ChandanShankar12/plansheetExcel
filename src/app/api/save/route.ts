import { writeFile } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const dataDir = join(process.cwd(), 'data');

    // Save each data type to its own file
    await Promise.all([
      writeFile(
        join(dataDir, 'spreadsheets.json'), 
        JSON.stringify(data.spreadsheets, null, 2)
      ),
      writeFile(
        join(dataDir, 'columns.json'), 
        JSON.stringify(data.columns, null, 2)
      ),
      writeFile(
        join(dataDir, 'rows.json'), 
        JSON.stringify(data.rows, null, 2)
      ),
      writeFile(
        join(dataDir, 'cells.json'), 
        JSON.stringify(data.cells, null, 2)
      )
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
} 