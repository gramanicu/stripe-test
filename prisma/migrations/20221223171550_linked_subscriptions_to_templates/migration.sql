/*
  Warnings:

  - Added the required column `subscriptionTemplateId` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "subscriptionTemplateId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriptionTemplateId_fkey" FOREIGN KEY ("subscriptionTemplateId") REFERENCES "subscription_templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
