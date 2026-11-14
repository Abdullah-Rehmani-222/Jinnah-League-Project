-- AlterTable: optional festival edition for the public Gallery filter (existing rows keep NULL)
ALTER TABLE "gallery_items" ADD COLUMN "edition" VARCHAR(20);

-- CreateIndex
CREATE INDEX "gallery_items_edition_status_display_order_idx" ON "gallery_items"("edition", "status", "display_order");
