import { db } from './index';
import { sql } from 'drizzle-orm';

async function setup() {
  try {
    // Test the connection
    await db.execute(sql`SELECT 1`);
    console.log('Database connection successful');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

setup(); 