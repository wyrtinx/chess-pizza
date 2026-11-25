/*
  Warnings:

  - Added the required column `position` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "position" INTEGER NOT NULL;
