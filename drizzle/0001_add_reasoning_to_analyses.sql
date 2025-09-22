-- Add reasoning column to analyses table
ALTER TABLE "analyses" ADD COLUMN "reasoning" text NOT NULL DEFAULT '';
