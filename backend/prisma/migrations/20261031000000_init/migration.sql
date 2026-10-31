-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "content_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "message_status" AS ENUM ('UNREAD', 'READ', 'RESOLVED');

-- CreateEnum
CREATE TYPE "media_file_type" AS ENUM ('IMAGE', 'LOGO', 'BANNER', 'DOCUMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "press_item_type" AS ENUM ('PRESS_COVERAGE', 'MEDIA_KIT');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "profile_image_url" TEXT,
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "role" "user_role" NOT NULL DEFAULT 'ADMIN',
    "email_verified_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token_hash" VARCHAR(64) NOT NULL,
    "csrf_token" VARCHAR(64) NOT NULL,
    "user_id" UUID NOT NULL,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(255),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(200),
    "message" TEXT NOT NULL,
    "status" "message_status" NOT NULL DEFAULT 'UNREAD',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_assets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "file_name" VARCHAR(255) NOT NULL,
    "original_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" "media_file_type" NOT NULL DEFAULT 'IMAGE',
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "alt_text" VARCHAR(255),
    "uploaded_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "media_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "media_asset_id" UUID NOT NULL,
    "title" VARCHAR(150),
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(150) NOT NULL,
    "slug" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(320),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_sections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "page_id" UUID NOT NULL,
    "section_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200),
    "content" JSONB NOT NULL DEFAULT '{}',
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hero_slides" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(200) NOT NULL,
    "subtitle" VARCHAR(200),
    "description" TEXT,
    "media_asset_id" UUID,
    "button_text" VARCHAR(60),
    "button_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_links" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform" VARCHAR(50) NOT NULL,
    "url" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "website_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "setting_key" VARCHAR(100) NOT NULL,
    "setting_group" VARCHAR(50) NOT NULL DEFAULT 'general',
    "setting_value" JSONB,
    "media_asset_id" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "website_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor_tiers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "logo_media_id" UUID,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sponsor_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "press_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(250) NOT NULL,
    "description" TEXT,
    "item_type" "press_item_type" NOT NULL,
    "source_name" VARCHAR(150),
    "published_on" DATE,
    "media_asset_id" UUID,
    "external_url" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "content_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "press_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_at_idx" ON "contact_messages"("status", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "media_assets_file_name_key" ON "media_assets"("file_name");

-- CreateIndex
CREATE INDEX "media_assets_file_type_created_at_idx" ON "media_assets"("file_type", "created_at" DESC);

-- CreateIndex
CREATE INDEX "media_assets_uploaded_by_idx" ON "media_assets"("uploaded_by");

-- CreateIndex
CREATE INDEX "gallery_items_status_display_order_idx" ON "gallery_items"("status", "display_order");

-- CreateIndex
CREATE INDEX "gallery_items_media_asset_id_idx" ON "gallery_items"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE INDEX "pages_status_idx" ON "pages"("status");

-- CreateIndex
CREATE INDEX "page_sections_page_id_display_order_idx" ON "page_sections"("page_id", "display_order");

-- CreateIndex
CREATE INDEX "hero_slides_status_display_order_idx" ON "hero_slides"("status", "display_order");

-- CreateIndex
CREATE INDEX "hero_slides_media_asset_id_idx" ON "hero_slides"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_platform_key" ON "social_links"("platform");

-- CreateIndex
CREATE INDEX "social_links_status_display_order_idx" ON "social_links"("status", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "website_settings_setting_key_key" ON "website_settings"("setting_key");

-- CreateIndex
CREATE INDEX "website_settings_setting_group_idx" ON "website_settings"("setting_group");

-- CreateIndex
CREATE INDEX "website_settings_media_asset_id_idx" ON "website_settings"("media_asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_tiers_name_key" ON "sponsor_tiers"("name");

-- CreateIndex
CREATE INDEX "sponsor_tiers_status_display_order_idx" ON "sponsor_tiers"("status", "display_order");

-- CreateIndex
CREATE INDEX "sponsor_tiers_logo_media_id_idx" ON "sponsor_tiers"("logo_media_id");

-- CreateIndex
CREATE INDEX "press_items_item_type_status_display_order_idx" ON "press_items"("item_type", "status", "display_order");

-- CreateIndex
CREATE INDEX "press_items_media_asset_id_idx" ON "press_items"("media_asset_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "website_settings" ADD CONSTRAINT "website_settings_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsor_tiers" ADD CONSTRAINT "sponsor_tiers_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "press_items" ADD CONSTRAINT "press_items_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
