import { pgTable, serial, text, integer, timestamp, boolean, uuid, jsonb, numeric, pgEnum } from 'drizzle-orm/pg-core'

export const categoryEnum = pgEnum('category', ['bug', 'feature', 'improvement'])

// NextAuth.js required tables - using singular names to match actual DB
export const users = pgTable('user', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const accounts = pgTable('account', {
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (account) => ({
  compoundKey: {
    primaryKey: [account.provider, account.providerAccountId],
  },
}))

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verificationToken', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const feedback = pgTable('feedback', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  rating: integer('rating').notNull(),
  category: categoryEnum('category').notNull(),
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
  reasoning: text('reasoning').notNull(), // AI reasoning for debugging and transparency
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Soft delete support
  isDeleted: boolean('is_deleted').default(false).notNull(),
  deletedAt: timestamp('deleted_at'),
})

// Feedback patterns table from the database screenshots
export const feedbackPatterns = pgTable('feedback_patterns', {
  id: uuid('id').defaultRandom().primaryKey(),
  pattern: text('pattern').notNull(),
  commonSolutions: jsonb('common_solutions').notNull(),
  successRate: numeric('success_rate').notNull(),
  usageCount: integer('usage_count').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
