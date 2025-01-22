import { db } from '../index';
import { cells, columns, rows } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function getOrCreateColumn(spreadsheetId: number, columnKey: string) {
  let column = await db.query.columns.findFirst({
    where: and(
      eq(columns.spreadsheetId, spreadsheetId),
      eq(columns.columnKey, columnKey)
    ),
  });

  if (!column) {
    const [newColumn] = await db.insert(columns)
      .values({
        spreadsheetId,
        columnKey,
        width: 80,
        hidden: false,
        metadata: {},
        title: null
      })
      .returning();
    column = newColumn;
  }

  return column;
}

export async function getOrCreateRow(spreadsheetId: number, rowIndex: number) {
  let row = await db.query.rows.findFirst({
    where: and(
      eq(rows.spreadsheetId, spreadsheetId),
      eq(rows.rowIndex, rowIndex)
    ),
  });

  if (!row) {
    const [newRow] = await db.insert(rows)
      .values({
        spreadsheetId,
        rowIndex,
      })
      .returning();
    row = newRow;
  }

  return row;
}

export async function updateCellValue(
  spreadsheetId: number,
  columnKey: string,
  rowIndex: number,
  value: string,
  formula?: string
) {
  const column = await getOrCreateColumn(spreadsheetId, columnKey);
  const row = await getOrCreateRow(spreadsheetId, rowIndex);

  let cell = await db.query.cells.findFirst({
    where: and(
      eq(cells.spreadsheetId, spreadsheetId),
      eq(cells.columnId, column.id),
      eq(cells.rowId, row.id)
    ),
  });

  if (cell) {
    await db.update(cells)
      .set({ value, formula })
      .where(eq(cells.id, cell.id));
  } else {
    await db.insert(cells)
      .values({
        spreadsheetId,
        columnId: column.id,
        rowId: row.id,
        value,
        formula,
      });
  }
} 