import { sql } from 'drizzle-orm';

export async function up(db) {
  await sql`
    ALTER TABLE workbook 
    ALTER COLUMN user_id TYPE BIGINT,
    ALTER COLUMN sheet_id TYPE BIGINT
  `;
}

export async function down(db) {
  await sql`
    ALTER TABLE workbook 
    ALTER COLUMN user_id TYPE INTEGER,
    ALTER COLUMN sheet_id TYPE INTEGER
  `;
} 