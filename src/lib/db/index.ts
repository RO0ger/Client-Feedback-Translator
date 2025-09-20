import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create postgres client optimized for Supabase Session Pooler
const client = postgres(process.env.DATABASE_URL!, {
  max: 3, // Allow more connections for better performance
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  connect_timeout: 30, // Increased timeout for better reliability
  socket_timeout: 60, // Increased socket timeout
  prepare: false, // Disable prepared statements for NextAuth compatibility
  transform: undefined,
  onnotice: () => {}, // Suppress notices
  ssl: 'require', // Session pooler requires SSL
  // Enhanced debugging in development
  debug: process.env.NODE_ENV === 'development' ? console.log : false,
})

// Initialize Drizzle with schema
export const db = drizzle(client, { schema })

// Export types for convenience
export type Database = typeof db
export * from './schema'
