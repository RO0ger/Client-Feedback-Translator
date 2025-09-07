import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create postgres client
const client = postgres(process.env.DATABASE_URL!, {
  max: 1, // Supabase connection limit consideration
  idle_timeout: 20,
  max_lifetime: 60 * 30,
})

// Initialize Drizzle with schema
export const db = drizzle(client, { schema })

// Export types for convenience
export type Database = typeof db
export * from './schema'
