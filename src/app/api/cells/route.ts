import { NextResponse } from 'next/server';
import { redis } from '@/cache/redis_client';
import { CellStyle } from '@/lib/types';
import { Cell } from '@/server/models/cell';
import { Sheet } from '@/server/models/sheet';
import { db } from '@/db/db';
import { cells } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

interface CellRequest {
  sheetId: string;
  cellId: string;
  value: string;
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

    // Parse cellId to get column and row
    const colLetter = cellId.match(/[A-Z]+/)?.[0];
    const rowIndex = parseInt(cellId.match(/\d+/)?.[0] || '0');
    if (!colLetter || !rowIndex) {
      return NextResponse.json(
        { error: 'Invalid cell ID format' },
        { status: 400 }
      );
    }

    // Create cell instance
    const cell = new Cell();
    cell.setValue(value);
    if (formula) cell.setFormula(formula);
    if (style) cell.style = style;
    cell.column = colLetter;
    cell.row = rowIndex;

    // Save to database
    const cellData = await db
      .insert(cells)
      .values({
        value: value,
        formula: formula || '',
        row: rowIndex,
        column: colLetter,
        style: style || {},
      })
      .onConflictDoUpdate({
        target: [cells.column, cells.row],
        set: {
          value: value,
          formula: formula || '',
          style: style || {},
        }
      })
      .returning();

    // Store in Redis cache
    const redisKey = `cell:${sheetId}:${cellId}`;
    const cellCache = cell.toJSON();
    await redis.set(redisKey, JSON.stringify(cellCache));

    return NextResponse.json({
      success: true,
      data: cellCache
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

    if (!sheetId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get cells from database
    const dbCells = await db.select()
      .from(cells)
      .where(
        eq(cells.id, sheetId)
      );

    // Convert to cell format
    const cellsMap: Record<string, any> = {};
    dbCells.forEach(cellData => {
      const cellId = `${cellData.column}${cellData.row}`;
      const cell = new Cell();
      cell.setValue(cellData.value);
      cell.setFormula(cellData.formula);
      cell.style = cellData.style;
      cell.column = cellData.column;
      cell.row = cellData.row;
      
      cellsMap[cellId] = cell.toJSON();
    });

    return NextResponse.json({
      success: true,
      data: cellsMap
    });

  } catch (error) {
    console.error('Failed to fetch cells:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cells' },
      { status: 500 }
    );
  }
}
