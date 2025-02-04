import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

// Add connection options for better debugging
const client = postgres(connectionString, {
  max: 10, // connection pool size
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
  debug: process.env.NODE_ENV === 'development',
});

// Test connection and permissions
async function testConnection() {
  try {
    // Test write permission
    await client`
      CREATE TABLE IF NOT EXISTS connection_test (
        id SERIAL PRIMARY KEY,
        test_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await client`INSERT INTO connection_test DEFAULT VALUES`;
    await client`DROP TABLE connection_test`;
    console.log('Database connection and write permissions verified');
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
}

testConnection();

export const db = drizzle(client, { schema });
