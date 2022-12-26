/*
  Warnings:

  - A unique constraint covering the columns `[stripeProductId]` on the table `plugins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeProductId]` on the table `subscription_templates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeProductId` to the `subscription_templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_subscriptionTemplateId_fkey";

-- AlterTable
ALTER TABLE "subscription_templates" ADD COLUMN     "stripeProductId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "subscriptionTemplateId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "plugins_stripeProductId_key" ON "plugins"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "subscription_templates_stripeProductId_key" ON "subscription_templates"("stripeProductId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionTemplateId_fkey" FOREIGN KEY ("subscriptionTemplateId") REFERENCES "subscription_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
