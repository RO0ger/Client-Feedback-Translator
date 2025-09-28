-- Make AI result fields nullable to support async processing
ALTER TABLE "analyses" ALTER COLUMN "interpretation" DROP NOT NULL;
ALTER TABLE "analyses" ALTER COLUMN "suggestions" DROP NOT NULL;
ALTER TABLE "analyses" ALTER COLUMN "confidence" DROP NOT NULL;
ALTER TABLE "analyses" ALTER COLUMN "reasoning" DROP NOT NULL;

