CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workbooks" jsonb,
	"active_workbook_id" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" varchar,
	"formula" text DEFAULT '',
	"row" integer NOT NULL,
	"column" varchar(10) NOT NULL,
	"style" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"cells" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "spreadsheets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sheets" jsonb,
	"active_sheet_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spreadsheet" jsonb,
	"config" jsonb,
	"user_id" varchar(255) NOT NULL,
	"theme" varchar(10) NOT NULL,
	"language" varchar(10) NOT NULL,
	"timezone" varchar(100) NOT NULL,
	"auto_save" boolean NOT NULL,
	"last_modified" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
