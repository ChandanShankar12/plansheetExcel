CREATE TABLE "workbook" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"sheet_id" integer NOT NULL,
	"row_index" integer NOT NULL,
	"column_index" integer NOT NULL,
	"value" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"merged_with" text
);
