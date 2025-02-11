import { NextResponse } from 'next/server';
import { redis } from '@/server/db/cache/redis_client';
import { CellStyle } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { db } from '@/server/db/db';
import { cells } from '@/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { CellController } from '@/server/controllers/cell-controller';

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

    // Parse cellId
    const colLetter = cellId.match(/[A-Z]+/)?.[0];
    const rowIndex = parseInt(cellId.match(/\d+/)?.[0] || '0');
    
    // Create cell data
    const cellData = {
      id: crypto.randomUUID(),
      value: value,
      formula: formula || '',
      row: rowIndex,
      column: colLetter,
      style: style || {},
    };

    const redisKey = `cell:${sheetId}:${cellId}`;
    await redis.set(redisKey, JSON.stringify(cellData));

    // Schedule database update after 2 seconds
    setTimeout(async () => {
      try {
        await db
          .insert(cells)
          .values(cellData);
      } catch (error) {
        console.error('Failed to persist cell to database:', error);
        await redis.set(`${redisKey}:error`, 'failed_to_persist');
      }
    }, 2000);

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

    // Try to get from Redis first
    const redisKey = `cell:${sheetId}:${cellId}`;
    const cachedData = await redis.get(redisKey);
    
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cachedData),
        source: 'cache'
      });
    }

    // If not in cache, get from database
    const dbCell = await db.select()
      .from(cells)
      .where(
        eq(cells.column, cellId.match(/[A-Z]+/)?.[0] || '')
      )
      .limit(1);

    if (dbCell.length > 0) {
      const cellData = dbCell[0];
      // Store in cache for future requests
      await redis.set(redisKey, JSON.stringify(cellData));
      
      return NextResponse.json({
        success: true,
        data: cellData,
        source: 'database'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Cell not found'
    }, { status: 404 });

  } catch (error) {
    console.error('Failed to fetch cell:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cell' },
      { status: 500 }
    );
  }
}
