import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';

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

    try {
      // Check if cell is in the modified set
      const isModified = await redis.sismember(`sheet:${sheetId}:modified_cells`, cellId);
      
      if (!isModified) {
        return NextResponse.json({
          success: true,
          data: null,
          modified: false
        });
      }

      const redisKey = `cell:${sheetId}:${cellId}`;
      const data = await redis.get(redisKey);
      
      if (!data) {
        await redis.srem(`sheet:${sheetId}:modified_cells`, cellId);
        return NextResponse.json({
          success: true,
          data: null,
          modified: false
        });
      }

      return NextResponse.json({
        success: true,
        data: JSON.parse(data),
        modified: true
      });
    } catch (redisError) {
      console.error('Redis operation failed:', redisError);
      return NextResponse.json({
        success: true,
        data: null,
        cached: false
      });
    }
  } catch (error) {
    console.error('Failed to fetch cell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cell' },
      { status: 500 }
    );
  }
} 