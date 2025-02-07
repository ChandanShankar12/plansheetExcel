import { NextResponse } from 'next/server';
import { redis } from '@/cache/redis_client';
import { CellData } from '@/lib/spreadsheet/types';
import { db } from '@/db/db';
import { workbook } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, sheetId, cellId, value, formula } = body;

    if (!userId || !sheetId || !cellId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract row and column from cellId (e.g. 'A1' -> row: 1, col: 1)
    const colLetter = cellId.match(/[A-Z]+/)?.[0] || 'A';
    const rowIndex = parseInt(cellId.match(/\d+/)?.[0] || '1');
    const columnIndex = colLetter.charCodeAt(0) - 64; // Convert A->1, B->2, etc.

    // Create data object matching the schema
    const cellData = {
      userId: BigInt(userId),
      sheetId: BigInt(sheetId),
      rowIndex: rowIndex,
      columnIndex: columnIndex,
      value: value || null,
      metadata: {
        formula: formula || undefined,
        style: {}
      },
      mergedWith: null
    };

    try {
      // Try to update first
      const result = await db.update(workbook)
        .set({
          ...cellData,
          userId: cellData.userId.toString(),
          sheetId: cellData.sheetId.toString(),
        })
        .where(
          and(
            eq(workbook.userId, cellData.userId.toString()),
            eq(workbook.sheetId, cellData.sheetId.toString()),
            eq(workbook.rowIndex, cellData.rowIndex),
            eq(workbook.columnIndex, cellData.columnIndex)
          )
        )
        .returning();

      // If no rows were updated, insert new record
      if (!result.length) {
        await db.insert(workbook)
          .values({
            ...cellData,
            userId: cellData.userId.toString(),
            sheetId: cellData.sheetId.toString(),
          });
      }

      // Store in Redis cache
      const redisKey = `cell:${userId}:${sheetId}:${cellId}`;
      await redis.set(redisKey, JSON.stringify({
        value: value,
        formula: formula,
        style: {}
      }));

      return NextResponse.json({
        success: true,
        data: {
          ...cellData,
          userId: cellData.userId.toString(),
          sheetId: cellData.sheetId.toString(),
        }
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Database operation failed');
    }

  } catch (error) {
    console.error('Failed to update cell:', error);
    return NextResponse.json(
      { error: 'Failed to update cell', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sheetId = searchParams.get('sheetId');

    if (!userId || !sheetId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get cells from database
    const dbCells = await db.select()
      .from(workbook)
      .where(
        and(
          eq(workbook.userId, Number(userId)),
          eq(workbook.sheetId, Number(sheetId))
        )
      );

    // Convert to cell format
    const cells: Record<string, any> = {};
    dbCells.forEach(cell => {
      const colLetter = String.fromCharCode(64 + cell.columnIndex);
      const cellId = `${colLetter}${cell.rowIndex}`;
      cells[cellId] = {
        value: cell.value,
        formula: cell.metadata?.formula,
        style: cell.metadata?.style || {}
      };
    });

    return NextResponse.json({
      success: true,
      data: cells
    });
  } catch (error) {
    console.error('Failed to fetch cells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cells' },
      { status: 500 }
    );
  }
}
