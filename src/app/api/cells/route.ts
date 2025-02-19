import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';
import { CellStyle } from '@/lib/types';

interface CellRequest {
  sheetId: string;
  cellId: string;
  value: string | null;
  formula?: string;
  style?: CellStyle;
}

export async function POST(request: Request) {
  try {
    const body: CellRequest = await request.json();
    const { sheetId, cellId, value, formula, style } = body;

    if (!sheetId || !cellId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const cellData = {
      id: cellId,
      value: value,
      formula: formula || '',
      style: style || {},
      lastModified: new Date().toISOString(),
      isModified: true
    };

    const redisKey = `cell:${sheetId}:${cellId}`;
    try {
      await redis.sadd(`sheet:${sheetId}:modified_cells`, cellId);
      await redis.set(redisKey, JSON.stringify(cellData));
      await redis.expire(redisKey, 24 * 60 * 60);

      return NextResponse.json({
        success: true,
        data: cellData
      });
    } catch (redisError) {
      console.error('Redis operation failed:', redisError);
      return NextResponse.json({
        success: true,
        data: cellData,
        cached: false
      });
    }
  } catch (error) {
    console.error('Failed to update cell:', error);
    return NextResponse.json(
      { error: 'Failed to update cell' },
      { status: 500 }
    );
  }
}
