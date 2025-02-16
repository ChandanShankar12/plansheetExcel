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
    const { sheetName, cellId, value, formula, style } = await request.json();

    if (!sheetName || !cellId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await redis.set(
      `cell:${sheetName}:${cellId}`,
      JSON.stringify({
        id: cellId,
        value,
        formula: formula || '',
        style: style || {}
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cell' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sheetName = searchParams.get('sheetName');
    const cellId = searchParams.get('cellId');

    if (!sheetName || !cellId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const cachedData = await redis.get(`cell:${sheetName}:${cellId}`);
    
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(cachedData)
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
