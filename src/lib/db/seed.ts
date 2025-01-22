import { db } from './index';
import { spreadsheets, columns, rows, cells } from './schema';

async function seed() {
  try {
    // Create a spreadsheet
    const [spreadsheet] = await db.insert(spreadsheets)
      .values({
        name: 'Sample Spreadsheet',
      })
      .returning();

    // Sample data structure
    const sampleData = {
      'A1': { value: 'Name' },
      'B1': { value: 'Age' },
      'C1': { value: 'City' },
      'A2': { value: 'John Doe' },
      'B2': { value: '30' },
      'C2': { value: 'New York' },
    };

    // Insert data
    for (const [cellId, data] of Object.entries(sampleData)) {
      const col = cellId.match(/[A-Z]+/)?.[0] || '';
      const row = parseInt(cellId.match(/\d+/)?.[0] || '0');

      // Create column
      const [column] = await db.insert(columns)
        .values({
          spreadsheetId: spreadsheet.id,
          columnKey: col,
          width: 80,
          hidden: false,
          metadata: {},
          title: null
        })
        .returning();

      // Create row
      const [rowRecord] = await db.insert(rows)
        .values({
          spreadsheetId: spreadsheet.id,
          rowIndex: row,
          height: 20,
          hidden: false,
          metadata: {},
          title: null
        })
        .returning();

      // Create cell
      await db.insert(cells)
        .values({
          spreadsheetId: spreadsheet.id,
          columnId: column.id,
          rowId: rowRecord.id,
          value: data.value,
          formula: data.value.startsWith('=') ? data.value : null,
          style: {},
          metadata: {}
        });
    }

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed(); 