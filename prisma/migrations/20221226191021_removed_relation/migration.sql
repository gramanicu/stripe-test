/*
  Warnings:

  - You are about to drop the column `subscriptionTemplateId` on the `subscriptions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_subscriptionTemplateId_fkey";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "subscriptionTemplateId";
