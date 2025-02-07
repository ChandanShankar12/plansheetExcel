CREATE TABLE "workbook" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"sheet_id" text NOT NULL,
	"row_index" integer NOT NULL,
	"column_index" integer NOT NULL,
	"value" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"merged_with" text
);
