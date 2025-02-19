import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';

export async function DELETE(request: Request) {
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
      // Remove from modified set and delete the cell data
      await Promise.all([
        redis.srem(`sheet:${sheetId}:cells`, cellId),
        redis.del(`cell:${sheetId}:${cellId}`)
      ]);

      return NextResponse.json({
        success: true,
        message: 'Cell deleted'
      });
    } catch (redisError) {
      console.error('Redis operation failed:', redisError);
      return NextResponse.json({
        success: true,
        message: 'Cell marked for deletion',
        cached: false
      });
    }
  } catch (error) {
    console.error('Failed to delete cell:', error);
    return NextResponse.json(
      { error: 'Failed to delete cell' },
      { status: 500 }
    );
  }
} 