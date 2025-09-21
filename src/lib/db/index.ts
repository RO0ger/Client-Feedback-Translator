import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Declare a global variable to hold the cached database client
declare global {
  // eslint-disable-next-line no-var
  var client: postgres.Sql | undefined;
}

let client: postgres.Sql;

// In development, use the global variable to preserve the client across hot reloads.
// In production, create a new client for each serverless function invocation.
if (process.env.NODE_ENV === 'production') {
  client = postgres(process.env.DATABASE_URL!, {
    max: 3,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    connect_timeout: 30,
    socket_timeout: 60,
    prepare: false,
    ssl: 'require',
  });
} else {
  if (!global.client) {
    global.client = postgres(process.env.DATABASE_URL!, {
      max: 3,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 30,
      socket_timeout: 60,
      prepare: false,
      ssl: 'require',
      debug: true, // Enable debug logging in development
    });
  }
  client = global.client;
}

export const db = drizzle(client, { schema });
export type Database = typeof db;
export * from './schema';
