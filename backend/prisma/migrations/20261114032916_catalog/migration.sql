-- CreateEnum
CREATE TYPE "product_category" AS ENUM ('PIZZA', 'DRINK', 'DESSERT');

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "category" "product_category" NOT NULL,
    "base_price" INTEGER NOT NULL,
    "weight_grams" INTEGER,
    "volume_ml" INTEGER,
    "is_vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "spicy_level" SMALLINT NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "image_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "toppings" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "price" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "toppings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pizzerias" (
    "id" UUID NOT NULL,
    "address" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pizzerias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_is_visible_deleted_at_idx" ON "products"("is_visible", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "toppings_code_key" ON "toppings"("code");

-- Check constraints are not expressible in the Prisma schema.
ALTER TABLE "products" ADD CONSTRAINT "products_base_price_check" CHECK ("base_price" > 0);
ALTER TABLE "products" ADD CONSTRAINT "products_spicy_level_check" CHECK ("spicy_level" BETWEEN 0 AND 4);
ALTER TABLE "toppings" ADD CONSTRAINT "toppings_price_check" CHECK ("price" >= 0);
