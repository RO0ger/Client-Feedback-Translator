import { pgTable, serial, text, integer, timestamp, boolean, uuid, jsonb, numeric } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  category: text('category').$type<'bug' | 'feature' | 'improvement'>().notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  
  // Audit trail fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
  
  // Soft delete
  deletedAt: timestamp('deleted_at'),
  deletedBy: uuid('deleted_by').references(() => users.id),
  isDeleted: boolean('is_deleted').default(false).notNull(),
})

export const translations = pgTable('translations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  original_feedback: text('original_feedback').notNull(),
  component_code: text('component_code').notNull(),
  component_name: text('component_name').notNull(),
  generated_changes: jsonb('generated_changes').notNull(),
  confidence_score: numeric('confidence_score').notNull(),
  user_rating: integer('user_rating'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const analyses = pgTable('analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  originalContent: text('original_content').notNull(),
  feedback: text('feedback').notNull(),
  interpretation: text('interpretation').notNull(),
  suggestions: text('suggestions').notNull(), // JSON string with diffs
  confidence: integer('confidence').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Soft delete support
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
})
