import { db } from '@/server/db/db';    
import { cells } from '@/server/db/schema';
import { Cell } from '@/server/models/cell';

export async function updateCell(cellId: string, cell: Cell) {
  // Update in database
  try {
    const colLetter = cellId.match(/[A-Z]+/)?.[0];
    const rowIndex = parseInt(cellId.match(/\d+/)?.[0] || '0');

    await db.insert(cells).values({
      value: cell.getValue(),
      formula: cell.getFormula() || '',
      column: colLetter || '',
      row: rowIndex,
      style: cell.style || {},
    });
  } catch (error) {
    console.error('Failed to update cell in database:', error);
  }
}