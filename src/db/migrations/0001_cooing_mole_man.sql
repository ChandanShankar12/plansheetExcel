ALTER TABLE "workbook" ALTER COLUMN "id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "workbook" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "workbook_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "workbook" ALTER COLUMN "user_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "workbook" ALTER COLUMN "sheet_id" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "workbook" ALTER COLUMN "value" SET DATA TYPE varchar;