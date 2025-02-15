import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';
import { CellStyle } from '@/lib/types';

interface CellRequest {
  sheetName: string;
  cellId: string;
  value: any | null;
  formula?: string;
  style?: CellStyle;
}

export async function POST(request: Request) {
  try {
    const body: CellRequest = await request.json();
    const { sheetName, cellId, value, formula, style } = body;

    if (!sheetName || !cellId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse cell coordinates
    const matches = cellId.match(/([A-Z]+)(\d+)/);
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid cell ID format' },
        { status: 400 }
      );
    }

    const [_, colLetter, rowIndex] = matches;
    
    // Create cell data in the correct format
    const cellData = {
      id: cellId,
      value: value,
      formula: formula || '',
      row: parseInt(rowIndex),
      column: colLetter,
      style: style || {},
    };

    // Save to Redis with the correct key format
    const redisKey = `cell:${sheetName}:${cellId}`;
    await redis.set(redisKey, JSON.stringify(cellData));

    // Verify data was saved
    const savedData = await redis.get(redisKey);
    if (!savedData) {
      throw new Error('Failed to verify saved data');
    }

    // Debug output
    // console.log('Saved cell data:', {
    //   key: redisKey,
    //   data: cellData
    // });
    
    return NextResponse.json({ 
      success: true,
      data: cellData 
    });
  } catch (error) {
    console.error('Failed to update cell:', error);
    return NextResponse.json(
      { error: 'Failed to update cell' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetId = searchParams.get('sheetId');
    const cellId = searchParams.get('cellId');

    if (!sheetId || !cellId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Try to get from Redis
    const redisKey = `cell:${sheetId}:${cellId}`;
    const cachedData = await redis.get(redisKey);
    
    if (cachedData) {
      const data = JSON.parse(cachedData);
      return NextResponse.json({
        success: true,
        data: data,
        source: 'cache'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Cell not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Failed to fetch cell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cell data' },
      { status: 500 }
    );
  }
}
