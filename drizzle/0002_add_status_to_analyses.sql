-- Add status and updated_at columns to analyses table
ALTER TABLE "analyses" ADD COLUMN "status" text DEFAULT 'PENDING' NOT NULL;
ALTER TABLE "analyses" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
